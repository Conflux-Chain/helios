import {Interface} from '@ethersproject/abi'
import {BigNumber} from '@ethersproject/bignumber'
import {decode, encode} from '@fluent-wallet/base32-address'
import {
  FUNGIBLE_TOKEN_EVENT_ABI,
  WRAPPED_NATIVE_TOKEN_EVENT_ABI,
} from '@fluent-wallet/contract-abis/token-abi.js'

const tokenInterface = new Interface([
  ...FUNGIBLE_TOKEN_EVENT_ABI,
  ...WRAPPED_NATIVE_TOKEN_EVENT_ABI,
])
const eventTopicCounts = new Map(
  ['Transfer', 'Deposit', 'Withdrawal'].map(name => [
    tokenInterface.getEventTopic(name).toLowerCase(),
    name === 'Transfer' ? 3 : 2,
  ]),
)
const addressPattern = /^0x[0-9a-f]{40}$/i
const wordPattern = /^0x[0-9a-f]{64}$/i
const zeroAddress = '0x0000000000000000000000000000000000000000'
const nativeTransferTypes = new Set([
  'CALL',
  'CREATE',
  'CREATE2',
  'SELFDESTRUCT',
])
const callTypes = new Set([
  ...nativeTransferTypes,
  'CALLCODE',
  'DELEGATECALL',
  'STATICCALL',
])

function isAddress(address) {
  return typeof address === 'string' && addressPattern.test(address)
}

function normalizeAddress(address) {
  return (
    isAddress(address) ? address : decode(address).hexAddress
  ).toLowerCase()
}

function validateFrame(frame) {
  if (
    !frame ||
    !callTypes.has(frame.type?.toUpperCase?.()) ||
    (frame.calls !== undefined && !Array.isArray(frame.calls)) ||
    (frame.logs !== undefined && !Array.isArray(frame.logs))
  )
    throw new Error(
      'Expected a callTracer call frame with calls and logs arrays',
    )
}

function isFailed(frame) {
  return Boolean(frame.error) || frame.failed === true
}

function parseTokenEvent(log) {
  // ERC721 shares the event signature, but indexes tokenId in a fourth topic.
  if (
    !log ||
    !Array.isArray(log.topics) ||
    log.topics.length !==
      eventTopicCounts.get(log.topics[0]?.toLowerCase?.()) ||
    !log.topics.every(
      topic => typeof topic === 'string' && wordPattern.test(topic),
    ) ||
    typeof log.data !== 'string' ||
    !wordPattern.test(log.data)
  )
    return

  try {
    const {name, args} = tokenInterface.parseLog({
      topics: log.topics.map(topic => topic.toLowerCase()),
      data: log.data.toLowerCase(),
    })
    const wrapping = name !== 'Transfer'
    const from =
      name === 'Deposit' ? zeroAddress : (args.from ?? args.src).toLowerCase()
    const to =
      name === 'Withdrawal' ? zeroAddress : (args.to ?? args.dst).toLowerCase()
    return {
      wrapping,
      transfer: {
        asset: {type: 'erc20', address: normalizeAddress(log.address)},
        from,
        to,
        amount: (wrapping ? args.wad : args.value).toString(),
      },
    }
  } catch {
    // Malformed or nonstandard events do not establish a token transfer.
    return
  }
}

function collectTokenTransfers(logs) {
  const events = logs.map(parseTokenEvent).filter(Boolean)
  const transferKey = ({asset, from, to, amount}) =>
    `${asset.address}:${from}:${to}:${amount}`
  const matchingTransfers = new Map()
  for (const {wrapping, transfer} of events) {
    if (wrapping) continue
    const key = transferKey(transfer)
    matchingTransfers.set(key, (matchingTransfers.get(key) ?? 0) + 1)
  }

  return events
    .filter(({wrapping, transfer}) => {
      if (!wrapping) return true
      // Some wrappers also emit Transfer for the same mint/burn. Match once
      // per event, within this call, so repeated deposits remain independent.
      const key = transferKey(transfer)
      const matches = matchingTransfers.get(key) ?? 0
      if (!matches) return true
      matchingTransfers.set(key, matches - 1)
      return false
    })
    .map(({transfer}) => transfer)
}

function parseNativeTransfer(frame) {
  // DELEGATECALL and CALLCODE can carry an inherited value without moving it.
  if (!nativeTransferTypes.has(frame.type.toUpperCase())) return
  if (frame.value === undefined) return
  if (typeof frame.value !== 'string' || !/^0x[0-9a-f]+$/i.test(frame.value))
    throw new Error('Invalid native transfer value in callTracer response')

  const amount = BigNumber.from(frame.value)
  if (amount.isZero()) return
  return {
    asset: {type: 'native'},
    from: normalizeAddress(frame.from),
    to: normalizeAddress(frame.to),
    amount: amount.toString(),
  }
}

function collectTransfers(trace) {
  const transfers = []
  const pending = [trace]
  while (pending.length) {
    const frame = pending.pop()
    validateFrame(frame)
    // A parent's revert also rolls back every successful descendant.
    if (isFailed(frame)) continue

    const nativeTransfer = parseNativeTransfer(frame)
    if (nativeTransfer) transfers.push(nativeTransfer)
    for (const transfer of collectTokenTransfers(frame.logs ?? []))
      transfers.push(transfer)

    const calls = frame.calls ?? []
    for (let i = calls.length - 1; i >= 0; i--) pending.push(calls[i])
  }
  return transfers
}

function aggregateChanges(transfers, accounts) {
  const watched = new Set(accounts.map(normalizeAddress))
  const changes = new Map()
  const addValue = (account, asset, value) => {
    // The zero address denotes mint/burn, rather than an account balance.
    if (account === zeroAddress || !watched.has(account)) return
    const key = `${account}:${asset.type}:${asset.address ?? ''}`
    let change = changes.get(key)
    if (!change) {
      change = {account, asset, amount: BigNumber.from(0)}
      changes.set(key, change)
    }
    change.amount = change.amount.add(value)
  }

  for (const {asset, from, to, amount} of transfers) {
    const value = BigNumber.from(amount)
    addValue(from, asset, value.mul(-1))
    addValue(to, asset, value)
  }

  return [...changes.values()]
    .filter(({amount}) => !amount.isZero())
    .map(({account, asset, amount}) => ({
      account,
      asset,
      amount: amount.abs().toString(),
      direction: amount.isNegative() ? 'out' : 'in',
    }))
}

export function parseAssetChanges(
  trace,
  {accounts, includeTransfers = false, network},
) {
  validateFrame(trace)
  if (isFailed(trace))
    return {
      status: 'reverted',
      changes: [],
      ...(includeTransfers ? {transfers: []} : {}),
      error: {
        message: trace.error || 'Execution failed',
        ...(trace.revertReason ? {reason: trace.revertReason} : {}),
        ...(trace.output !== undefined ? {data: trace.output} : {}),
      },
    }

  const transfers = collectTransfers(trace)
  // Match and aggregate in hex; expose addresses in the network's RPC format.
  const formatAddress = address =>
    network?.type === 'cfx' ? encode(address, network.netId) : address
  const formatAsset = asset =>
    asset.address ? {...asset, address: formatAddress(asset.address)} : asset

  return {
    status: 'success',
    changes: aggregateChanges(transfers, accounts).map(change => ({
      ...change,
      account: formatAddress(change.account),
      asset: formatAsset(change.asset),
    })),
    ...(includeTransfers
      ? {
          transfers: transfers.map(transfer => ({
            ...transfer,
            from: formatAddress(transfer.from),
            to: formatAddress(transfer.to),
            asset: formatAsset(transfer.asset),
          })),
        }
      : {}),
  }
}
