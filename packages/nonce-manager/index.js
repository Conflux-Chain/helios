import {toHexQuantity, toUnsignedBN} from '@fluent-wallet/utils'

const toNonceKey = nonce => toUnsignedBN(nonce).toString(10)

const createNonceSequence = (startNonce, nonceCount) =>
  Array.from({length: nonceCount}, (_, offset) =>
    toHexQuantity(startNonce.clone().addn(offset)),
  )

/**
 * Returns whether an EIP-7702 authorization cannot use the current EOA nonce.
 *
 * Authorization nonce must match the network pending nonce exactly.
 * It cannot skip a pending transaction or a locally occupied nonce.
 *
 * @param {Object} options
 * @param {string} options.networkLatestNonce Latest confirmed EOA nonce.
 * @param {string} options.networkPendingNonce Pending EOA nonce.
 * @param {string[]} [options.occupiedNonces=[]] Locally occupied EOA nonces.
 * @returns {boolean}
 */
export function hasEip7702AuthorizationNonceConflict({
  networkLatestNonce,
  networkPendingNonce,
  occupiedNonces = [],
}) {
  return (
    !toUnsignedBN(networkLatestNonce).eq(toUnsignedBN(networkPendingNonce)) ||
    occupiedNonces.length > 0
  )
}

/**
 * Returns consecutive nonces for a transaction.
 *
 * Users can set a custom nonce to replace a pending transaction.
 * Automatic selection only returns nonces that are not in use.
 *
 * @param {Object} options
 * @param {string} options.networkPendingNonce First nonce to try when choosing automatically.
 * @param {string[]} [options.occupiedNonces=[]] Nonces already in use locally.
 * @param {number} [options.nonceCount=1] Number of nonces to return.
 * @param {string} [options.customNonce] Starting nonce chosen by the user.
 * @returns {string[]} Nonces formatted as hex quantities.
 */
export function resolveTransactionNonces({
  networkPendingNonce,
  occupiedNonces = [],
  nonceCount = 1,
  customNonce,
}) {
  if (!Number.isInteger(nonceCount) || nonceCount < 1) {
    throw new TypeError(`Invalid nonce count "${nonceCount}"`)
  }

  if (customNonce !== undefined) {
    return createNonceSequence(toUnsignedBN(customNonce), nonceCount)
  }

  const occupied = new Set(occupiedNonces.map(toNonceKey))
  const startNonce = toUnsignedBN(networkPendingNonce).clone()

  while (occupied.has(toNonceKey(startNonce))) {
    startNonce.iaddn(1)
  }

  const nonces = createNonceSequence(startNonce, nonceCount)
  const conflictingNonce = nonces.find(nonce => occupied.has(toNonceKey(nonce)))

  if (conflictingNonce) {
    throw new Error(`Nonce ${conflictingNonce} is already occupied`)
  }

  return nonces
}

const nonceLocks = new Map()

async function withNonceLock(key, task) {
  const previous = nonceLocks.get(key)

  let release
  const current = new Promise(resolve => {
    release = resolve
  })

  nonceLocks.set(key, current)

  if (previous) {
    await previous
  }

  try {
    return await task()
  } finally {
    release()

    if (nonceLocks.get(key) === current) {
      nonceLocks.delete(key)
    }
  }
}

const createEthereumNonceLockKey = ({chainId, address}) =>
  `eth:${toHexQuantity(toUnsignedBN(chainId))}:${address.toLowerCase()}`

const createUserOperationNonceLockKey = ({chainId, entryPoint, sender}) =>
  [
    'user-operation',
    toHexQuantity(toUnsignedBN(chainId)),
    entryPoint.toLowerCase(),
    sender.toLowerCase(),
  ].join(':')

export function withEthereumNonceLock({chainId, address}, task) {
  return withNonceLock(createEthereumNonceLockKey({chainId, address}), task)
}

export function withConfluxNonceLock({address}, task) {
  return withNonceLock(address.toLowerCase(), task)
}

export function withUserOperationNonceLock(
  {chainId, entryPoint, sender},
  task,
) {
  return withNonceLock(
    createUserOperationNonceLockKey({chainId, entryPoint, sender}),
    task,
  )
}
