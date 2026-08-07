import {toHexQuantity, toUnsignedBN} from '@fluent-wallet/utils'

const toNonceKey = nonce => toUnsignedBN(nonce).toString(10)

const createNonceSequence = (startNonce, nonceCount) =>
  Array.from({length: nonceCount}, (_, offset) =>
    toHexQuantity(startNonce.clone().addn(offset)),
  )

/**
 * Returns consecutive nonces for a new transaction.
 *
 * @param {Object} options
 * @param {string} options.networkPendingNonce Network pending nonce.
 * @param {string[]} [options.occupiedNonces=[]] Locally occupied nonces.
 * @param {number} [options.nonceCount=1] Number of nonces to return.
 * @param {string} [options.customNonce] User-selected starting nonce.
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

  const networkPending = toUnsignedBN(networkPendingNonce)
  const occupied = new Set(occupiedNonces.map(toNonceKey))
  const hasCustomNonce = customNonce !== undefined

  let startNonce = toUnsignedBN(
    hasCustomNonce ? customNonce : networkPendingNonce,
  ).clone()

  if (hasCustomNonce && startNonce.lt(networkPending)) {
    throw new Error(
      `Custom nonce ${toHexQuantity(
        startNonce,
      )} is below network pending nonce ${toHexQuantity(networkPending)}`,
    )
  }

  if (!hasCustomNonce) {
    while (occupied.has(toNonceKey(startNonce))) {
      startNonce.iaddn(1)
    }
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
