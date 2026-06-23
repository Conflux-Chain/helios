import * as spec from '@fluent-wallet/spec'
import BN from 'bn.js'
import {addHexPrefix, stripHexPrefix} from '@fluent-wallet/utils'
import {iface as erc20Iface} from '@fluent-wallet/contract-abis/777.js'
import {
  buildTokenPayEstimateStateOverride,
  fetchTokenPayPrice,
  prepareGasTokenQuote,
  prepareTokenPayAccountContext,
  prepareTokenPayExecutionContext,
} from '@fluent-wallet/wallet_prepare-token-pay-quote'

const {map, dbid, enums, or, ethHexAddress, eq} = spec
const NATIVE_TOKEN_BALANCE_KEY = '0x0'

export const NAME = 'wallet_getTokenPayMaxSendable'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['networkDbId', dbid],
    ['accountId', dbid],
    ['toAddress', ethHexAddress],
    ['sendTokenAddress', [or, [eq, NATIVE_TOKEN_BALANCE_KEY], ethHexAddress]],
    ['gasLevel', [enums, 'low', 'medium', 'high']],
  ],
}

export const permissions = {
  external: ['popup'],
  locked: true,
  methods: [
    'wallet_getBalance',
    'wallet_getTokenPayConfig',
    'eth_getTransactionCount',
    'eth_gasPrice',
    'eth_estimateGas',
    'wallet_network1559Compatible',
  ],
  db: ['getAccountById', 'getNetworkById', 'accountAddrByNetwork'],
}

function bnHex(value) {
  return new BN(stripHexPrefix(value || '0x0'), 16)
}

function toHex(value) {
  return addHexPrefix(value.toString(16))
}

function getTokenBalanceKey(address) {
  return address === NATIVE_TOKEN_BALANCE_KEY
    ? NATIVE_TOKEN_BALANCE_KEY
    : address.toLowerCase()
}

function canPayWithBalance({balance, tokenCost, occupiedAmount = '0x0'}) {
  return bnHex(balance).sub(bnHex(occupiedAmount)).gte(bnHex(tokenCost))
}

function buildFullBalanceUserTx({
  accountAddress,
  toAddress,
  sendTokenAddress,
  sendTokenBalance,
}) {
  if (sendTokenAddress === NATIVE_TOKEN_BALANCE_KEY) {
    return {
      from: accountAddress,
      to: toAddress.toLowerCase(),
      value: sendTokenBalance,
    }
  }

  return {
    from: accountAddress,
    to: sendTokenAddress.toLowerCase(),
    value: '0x0',
    data: erc20Iface.encodeFunctionData('transfer', [
      toAddress.toLowerCase(),
      sendTokenBalance,
    ]),
  }
}

async function estimateUserTxGas({eth_estimateGas, context, userTx}) {
  // Full-balance native sends need temporary gas headroom for estimation.
  return eth_estimateGas({networkName: context.network.name}, [
    userTx,
    'latest',
    buildTokenPayEstimateStateOverride({
      accountAddress: context.accountAddress,
      maxGasCost: context.tokenPayConfig.maxGasCost,
      txValue: userTx.value,
    }),
  ])
}

function getNativeGasCost({userTx, context}) {
  const gasPrice = context.feeParams.maxFeePerGas || context.feeParams.gasPrice

  return toHex(bnHex(userTx.gas).mul(bnHex(gasPrice)))
}

function createNoGasResult() {
  return {
    canPayGas: false,
    shouldDeductGas: false,
    maxSendable: '0x0',
    gasTokenAddress: null,
    tokenCost: null,
    reason: 'insufficientGasBalance',
  }
}

function createFullBalanceResult({
  sendTokenBalance,
  gasTokenAddress,
  tokenCost,
}) {
  return {
    canPayGas: true,
    shouldDeductGas: false,
    maxSendable: sendTokenBalance,
    gasTokenAddress,
    tokenCost,
    reason: null,
  }
}
function createDeductGasResult({sendTokenBalance, gasTokenAddress, tokenCost}) {
  const maxSendable = bnHex(sendTokenBalance).sub(bnHex(tokenCost))

  return {
    canPayGas: maxSendable.gten(0),
    shouldDeductGas: true,
    maxSendable: toHex(maxSendable.gten(0) ? maxSendable : new BN(0)),
    gasTokenAddress,
    tokenCost,
    reason: maxSendable.gten(0) ? null : 'insufficientGasBalance',
  }
}

async function getBalances({
  wallet_getBalance,
  accountAddress,
  tokenAddresses,
}) {
  const balanceData = await wallet_getBalance({
    users: [accountAddress],
    tokens: [...new Set(tokenAddresses.map(getTokenBalanceKey))],
  })

  return balanceData?.[accountAddress.toLowerCase()] || {}
}

async function prepareGasTokenCostQuote({
  rpcs,
  context,
  gasLevel,
  userTx,
  gasToken,
  InvalidParams,
}) {
  const {
    network,
    accountAddress,
    tokenPayConfig,
    tokenPayNetworkConfig,
    txType,
    nonceBase,
    feeParams,
    quoteToken,
    quoteTokenPrice,
    estimateStateOverride,
  } = context

  const tokenPrice = await fetchTokenPayPrice(
    tokenPayNetworkConfig.backendBaseUrl,
    gasToken.address,
  )
  const quote = await prepareGasTokenQuote({
    eth_estimateGas: rpcs.eth_estimateGas,
    network,
    accountAddress,
    userTx,
    gasToken,
    tokenPayConfig,
    nonceBase,
    feeParams,
    gasLevel,
    txType,
    tokenPrice,
    quoteToken,
    quoteTokenPrice,
    estimateStateOverride,
    InvalidParams,
    includeTxs: false,
  })

  return {
    gasToken,
    tokenCost: quote.tokenCost,
  }
}

async function findPayableGasTokenQuote({
  rpcs,
  context,
  gasLevel,
  userTx,
  balances,
  sendTokenBalanceKey,
  InvalidParams,
  includeSendToken,
}) {
  for (const gasToken of context.tokenPayConfig.tokens) {
    const gasTokenBalanceKey = getTokenBalanceKey(gasToken.address)

    if (!includeSendToken && gasTokenBalanceKey === sendTokenBalanceKey) {
      continue
    }

    if (includeSendToken && gasTokenBalanceKey !== sendTokenBalanceKey) {
      continue
    }

    const gasTokenBalance = balances[gasTokenBalanceKey] || '0x0'

    if (bnHex(gasTokenBalance).isZero()) {
      continue
    }

    try {
      const quote = await prepareGasTokenCostQuote({
        rpcs,
        context,
        gasLevel,
        userTx,
        gasToken,
        InvalidParams,
      })

      if (
        canPayWithBalance({
          balance: gasTokenBalance,
          tokenCost: quote.tokenCost,
        })
      ) {
        return quote
      }
    } catch (err) {
      // This gas token cannot produce a usable quote; try the next candidate.
    }
  }

  return null
}

export const main = async ({
  Err: {InvalidParams},
  db,
  rpcs,
  params: {networkDbId, accountId, toAddress, sendTokenAddress, gasLevel},
}) => {
  // Step 1: Load account, network, and token-pay config.
  const baseContext = await prepareTokenPayAccountContext({
    InvalidParams,
    db,
    rpcs,
    params: {networkDbId, accountId},
    ignoreQuoteTokenPriceError: true,
  })

  // Step 2: Build a transaction that sends the full token balance.
  const sendTokenBalanceKey = getTokenBalanceKey(sendTokenAddress)
  const tokenAddresses = [
    NATIVE_TOKEN_BALANCE_KEY,
    sendTokenBalanceKey,
    ...baseContext.tokenPayConfig.tokens.map(token => token.address),
  ]
  const balances = await getBalances({
    wallet_getBalance: rpcs.wallet_getBalance,
    accountAddress: baseContext.accountAddress,
    tokenAddresses,
  })
  const sendTokenBalance = balances[sendTokenBalanceKey] || '0x0'
  const fullBalanceUserTx = buildFullBalanceUserTx({
    accountAddress: baseContext.accountAddress,
    toAddress,
    sendTokenAddress: sendTokenBalanceKey,
    sendTokenBalance,
  })

  // Step 3: Estimate gas for the full-balance transaction.
  const userTx = {
    ...fullBalanceUserTx,
    gas: await estimateUserTxGas({
      eth_estimateGas: rpcs.eth_estimateGas,
      context: baseContext,
      userTx: fullBalanceUserTx,
    }),
  }

  // Step 4: Prepare quote context with the estimated transaction gas.
  const context = await prepareTokenPayExecutionContext({
    InvalidParams,
    db,
    rpcs,
    params: {networkDbId, accountId, userTx, gasLevel},
    baseContext,
  })

  // Step 5: Use the RPC-read balances to check gas payment candidates.
  const nativeGasCost = getNativeGasCost({userTx, context})
  const isNativeSendToken = sendTokenBalanceKey === NATIVE_TOKEN_BALANCE_KEY

  // Step 6: If native gas can pay for a non-native send, keep full balance.
  if (
    !isNativeSendToken &&
    nativeGasCost &&
    canPayWithBalance({
      balance: balances[NATIVE_TOKEN_BALANCE_KEY],
      tokenCost: nativeGasCost,
    })
  ) {
    return createFullBalanceResult({
      sendTokenBalance,
      gasTokenAddress: NATIVE_TOKEN_BALANCE_KEY,
      tokenCost: nativeGasCost,
    })
  }

  // Step 7: If another gas token can pay, keep full balance.
  if (context.tokenPayConfig.tokens.length) {
    const otherGasTokenQuote = await findPayableGasTokenQuote({
      rpcs,
      context,
      gasLevel,
      userTx,
      balances,
      sendTokenBalanceKey,
      InvalidParams,
      includeSendToken: false,
    })

    if (otherGasTokenQuote) {
      return createFullBalanceResult({
        sendTokenBalance,
        gasTokenAddress: otherGasTokenQuote.gasToken.address,
        tokenCost: otherGasTokenQuote.tokenCost,
      })
    }
  }

  // Step 8: For native sends, deduct native gas when native gas must pay.
  if (nativeGasCost && isNativeSendToken) {
    const nativeMaxSendable = bnHex(sendTokenBalance).sub(bnHex(nativeGasCost))

    if (nativeMaxSendable.gten(0)) {
      return createDeductGasResult({
        sendTokenBalance,
        gasTokenAddress: NATIVE_TOKEN_BALANCE_KEY,
        tokenCost: nativeGasCost,
      })
    }
  }

  // Step 9: Stop if there are no token-pay gas tokens.
  if (!context.tokenPayConfig.tokens.length) {
    return createNoGasResult()
  }

  // Step 10: If the send token is the gas token, deduct its gas cost.
  const sendTokenGasQuote = await findPayableGasTokenQuote({
    rpcs,
    context,
    gasLevel,
    userTx,
    balances,
    sendTokenBalanceKey,
    InvalidParams,
    includeSendToken: true,
  })

  if (sendTokenGasQuote) {
    return createDeductGasResult({
      sendTokenBalance,
      gasTokenAddress: sendTokenGasQuote.gasToken.address,
      tokenCost: sendTokenGasQuote.tokenCost,
    })
  }

  // Step 11: No available token can pay the gas.
  return createNoGasResult()
}
