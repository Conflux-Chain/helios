import {Interface, checkResultErrors} from '@ethersproject/abi'
import {BigNumber} from '@ethersproject/bignumber'
import {
  V2_SWAP_ABI,
  V3_SWAP_ABI,
  V3_SWAP_ROUTER_02_ABI,
  SWAP_MULTICALL_ABI,
} from '@fluent-wallet/contract-abis/swap-abi.js'
import {SWAP_ROUTER_ALLOWLIST, WRAPPED_NATIVE_TOKENS} from '../constants/swap'

const swapInterface = new Interface([
  ...V2_SWAP_ABI,
  ...V3_SWAP_ABI,
  ...V3_SWAP_ROUTER_02_ABI,
  ...SWAP_MULTICALL_ABI,
])
const v2Methods = new Set(
  Object.values(new Interface(V2_SWAP_ABI).functions).map(({name}) => name),
)
const v3Methods = new Set([
  'exactInputSingle',
  'exactInput',
  'exactOutputSingle',
  'exactOutput',
])
const permitMethods = new Set([
  'selfPermit',
  'selfPermitIfNecessary',
  'selfPermitAllowed',
  'selfPermitAllowedIfNecessary',
])
const nativeOutputMethods = new Set([
  'swapExactTokensForETH',
  'swapTokensForExactETH',
  'swapExactTokensForETHSupportingFeeOnTransferTokens',
])
const zeroAddress = '0x0000000000000000000000000000000000000000'
// SwapRouter02 recipient placeholders, resolved against the transaction.
const senderRecipientSentinel = '0x0000000000000000000000000000000000000001'
const routerRecipientSentinel = '0x0000000000000000000000000000000000000002'
const tokenAsset = address => ({type: 'erc20', address})
const nativeAsset = {type: 'native'}
const sameAddress = (a, b) =>
  typeof a === 'string' &&
  typeof b === 'string' &&
  a.toLowerCase() === b.toLowerCase()

function normalizeChainId(value) {
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value) || value <= 0) return null
  } else if (typeof value !== 'string' || !/^(0x[\da-f]+|\d+)$/i.test(value)) {
    return null
  }
  const chainId = BigNumber.from(
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  return chainId.isZero() ? null : chainId.toString()
}

function parseCall(data) {
  const call = swapInterface.parseTransaction({data})
  // ethers defers some argument decoding errors until the field is accessed.
  return checkResultErrors(call.args).length ? null : call
}

function toSenderSummary({method, recipient, input, output}, from) {
  return {
    method,
    recipient,
    input,
    output: sameAddress(from, recipient) ? output : null,
  }
}

function decodeV2(call, tx, value) {
  const {args, name, functionFragment} = call
  const {path} = args
  if (path.length < 2) return null
  const nativeInput = functionFragment.payable
  if (!nativeInput && !value.isZero()) return null
  const exactInput = args.amountOutMin !== undefined
  const amountIn = nativeInput
    ? value
    : exactInput
    ? args.amountIn
    : args.amountInMax

  return toSenderSummary(
    {
      method: name,
      recipient: args.to,
      input: {
        asset: nativeInput ? nativeAsset : tokenAsset(path[0]),
        amount: amountIn.toString(),
        amountType: exactInput ? 'exact' : 'maximum',
      },
      output: {
        asset: nativeOutputMethods.has(name)
          ? nativeAsset
          : tokenAsset(path[path.length - 1]),
        amount: (exactInput ? args.amountOutMin : args.amountOut).toString(),
        amountType: exactInput ? 'minimum' : 'exact',
      },
    },
    tx.from,
  )
}

function decodeV3PathEndpoints(path, exactInput) {
  // address (20 bytes), then one or more fee (3) + address (20) segments.
  if (!/^0x[\da-f]+$/i.test(path)) return null
  const bytes = (path.length - 2) / 2
  if (bytes < 43 || (bytes - 20) % 23 !== 0) return null
  const endpoints = [path.slice(0, 42), `0x${path.slice(-40)}`]
  return exactInput ? endpoints : endpoints.reverse()
}

function decodeV3Route(call, tx) {
  if (!v3Methods.has(call.name)) return null
  const params = call.args.params
  // A nonzero price limit can allow partial fills, which this summary does
  // not model. Reject these requests rather than assume the full amount.
  if (params.sqrtPriceLimitX96 && !params.sqrtPriceLimitX96.isZero())
    return null
  const exactInput =
    call.name === 'exactInput' || call.name === 'exactInputSingle'
  const endpoints =
    params.path !== undefined
      ? decodeV3PathEndpoints(params.path, exactInput)
      : [params.tokenIn, params.tokenOut]
  if (!endpoints || sameAddress(endpoints[0], endpoints[1])) return null

  const amountIn = exactInput ? params.amountIn : params.amountInMaximum
  const amountOut = exactInput ? params.amountOutMinimum : params.amountOut
  // SwapRouter02 exact-input calls use zero input to spend the router's
  // balance, which calldata alone cannot determine. Other zero input amounts
  // and exact-output zero amounts are conservatively unsupported here;
  // this does not assign them the same router-balance semantics.
  if (amountIn.isZero() || (!exactInput && amountOut.isZero())) return null
  let recipient = params.recipient
  // The matched ABI's deadline field identifies the original SwapRouter
  // signature, whose zero recipient means the router. SwapRouter02 omits
  // this field and uses the sender/router sentinels instead.
  if (params.deadline !== undefined) {
    if (sameAddress(recipient, zeroAddress)) recipient = tx.to
  } else {
    if (sameAddress(recipient, senderRecipientSentinel)) recipient = tx.from
    else if (sameAddress(recipient, routerRecipientSentinel)) recipient = tx.to
  }
  if (!recipient) return null

  return {
    method: call.name,
    exactInput,
    tokenIn: endpoints[0].toLowerCase(),
    tokenOut: endpoints[1].toLowerCase(),
    amountIn,
    amountOut,
    recipient,
  }
}

function decodeV3(call, tx, value, wrappedNative) {
  const calls =
    call.name === 'multicall' ? call.args.data.map(parseCall) : [call]
  const routes = []
  let settlement
  // Tracks the requested refund call, not whether execution returns any funds.
  let hasRefundCall = false

  for (const child of calls) {
    if (!child) return null
    if (permitMethods.has(child.name)) {
      if (routes.length) return null
    } else if (v3Methods.has(child.name)) {
      if (settlement || hasRefundCall) return null
      const route = decodeV3Route(child, tx)
      if (!route) return null
      routes.push(route)
    } else if (child.name === 'unwrapWETH9' || child.name === 'sweepToken') {
      if (!routes.length || settlement) return null
      settlement = child
    } else if (child.name === 'refundETH') {
      if (!routes.length || hasRefundCall) return null
      hasRefundCall = true
    } else {
      // Includes nested multicalls, V2 legs, fees, and unknown operations.
      return null
    }
  }

  const first = routes[0]
  if (!first) return null
  if (
    routes.some(
      route =>
        route.exactInput !== first.exactInput ||
        route.tokenIn !== first.tokenIn ||
        route.tokenOut !== first.tokenOut,
    )
  )
    return null

  let settlementRecipient
  let unwrap = false
  if (settlement) {
    if (!routes.some(route => sameAddress(route.recipient, tx.to))) return null
    unwrap = settlement.name === 'unwrapWETH9'
    const settlementToken = unwrap ? wrappedNative : settlement.args.token
    if (!sameAddress(settlementToken, first.tokenOut)) return null
    // Explicit settlement recipients are literal, not swap sentinels.
    settlementRecipient = settlement.args.recipient ?? tx.from
    if (!settlementRecipient) return null
  }

  const outputs = routes.map(route => {
    const settled = settlement && sameAddress(route.recipient, tx.to)
    return {
      recipient: settled ? settlementRecipient : route.recipient,
      native: Boolean(settled && unwrap),
    }
  })
  const output = outputs[0]
  if (
    outputs.some(
      item =>
        !sameAddress(item.recipient, output.recipient) ||
        item.native !== output.native,
    )
  )
    return null

  let amountIn = BigNumber.from(0)
  let directOut = BigNumber.from(0)
  let settledOut = BigNumber.from(0)
  for (const route of routes) {
    amountIn = amountIn.add(route.amountIn)
    if (settlement && sameAddress(route.recipient, tx.to)) {
      settledOut = settledOut.add(route.amountOut)
    } else {
      directOut = directOut.add(route.amountOut)
    }
  }
  // One sweep/unwrap minimum covers all router-held legs together.
  if (
    first.exactInput &&
    settlement &&
    settledOut.lt(settlement.args.amountMinimum)
  ) {
    settledOut = settlement.args.amountMinimum
  }
  const amountOut = directOut.add(settledOut)
  const nativeInput = !value.isZero()
  if (
    nativeInput &&
    (!sameAddress(first.tokenIn, wrappedNative) ||
      value.lt(amountIn) ||
      (value.gt(amountIn) && !hasRefundCall))
  )
    return null

  return toSenderSummary(
    {
      method: routes.length === 1 ? first.method : 'multicall',
      recipient: output.recipient,
      input: {
        asset: nativeInput ? nativeAsset : tokenAsset(first.tokenIn),
        amount: amountIn.toString(),
        amountType: first.exactInput ? 'exact' : 'maximum',
      },
      output: {
        asset: output.native ? nativeAsset : tokenAsset(first.tokenOut),
        amount: amountOut.toString(),
        amountType: first.exactInput ? 'minimum' : 'exact',
      },
    },
    tx.from,
  )
}

/**
 * @typedef {Object} SwapAmount
 * @property {{type: 'native'} | {type: 'erc20', address: string}} asset
 * @property {string} amount Decimal integer string in the asset's smallest unit.
 * @property {'exact' | 'minimum' | 'maximum'} amountType Whether the request
 * declares an exact amount, a minimum output, or a maximum input. These are
 * request values and bounds, not guarantees of actual spending or receipt.
 */

/**
 * @typedef {Object} SenderSwapSummary
 * @property {string} method Swap method name, or 'multicall' for multiple routes.
 * @property {string} recipient Resolved output recipient, including settlement.
 * @property {SwapAmount} input Declared input amount or upper bound.
 * @property {SwapAmount | null} output Declared output amount or lower bound.
 * Null when the recipient does not match tx.from or tx.from is missing; it
 * means receipt by the sender is unconfirmed, not that the swap has no output.
 */

/**
 * Decode a supported swap request into a summary for its transaction sender.
 * This does not simulate execution, refunds, or actual balance changes.
 * Address admission does not bind a router to a particular ABI/version.
 *
 * @param {Object | null | undefined} tx Transaction request; tx.from identifies
 * the sender whose incoming assets may be shown, not the UI's selected account.
 * @param {Object | null | undefined} network Network type and chainId used for
 * address admission and wrapped native token lookup.
 * @returns {SenderSwapSummary | null} Null when a supported summary cannot be
 * established; this does not imply that the transaction is invalid on-chain.
 */
export function decodeSwapTransaction(tx, network) {
  if (network?.type !== 'eth' || typeof tx?.to !== 'string') return null
  try {
    const chainId = normalizeChainId(network.chainId)
    if (!SWAP_ROUTER_ALLOWLIST[chainId]?.includes(tx.to.toLowerCase()))
      return null
    if (tx.chainId != null && normalizeChainId(tx.chainId) !== chainId)
      return null
    const value = BigNumber.from(tx.value ?? 0)
    if (value.isNegative()) return null
    const call = parseCall(tx.data ?? tx.input)
    if (!call) return null
    return v2Methods.has(call.name)
      ? decodeV2(call, tx, value)
      : decodeV3(call, tx, value, WRAPPED_NATIVE_TOKENS[chainId])
  } catch {
    // Invalid ABI arguments and unknown selectors cannot establish a summary.
    return null
  }
}
