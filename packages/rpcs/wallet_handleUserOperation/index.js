import {Bytes32, dbid, map} from '@fluent-wallet/spec'
import {createBundlerClient} from '@fluent-wallet/bundler-client'
import {EIP7702_NETWORK_CONFIGS} from '@fluent-wallet/consts'

export const NAME = 'wallet_handleUserOperation'

export const schemas = {
  input: [map, {closed: true}, ['hash', Bytes32], ['networkId', dbid]],
}

export const permissions = {
  external: [],
  locked: true,
  methods: [],
  db: ['getOneUserOperation', 'getNetworkById', 'setUserOperationIncluded'],
}

const activeTrackers = new Map()

const wait = milliseconds =>
  new Promise(resolve => setTimeout(resolve, milliseconds))

async function trackUserOperation({
  getOneUserOperation,
  getNetworkById,
  setUserOperationIncluded,
  hash,
  networkId,
}) {
  let bundlerClient
  let pollInterval

  for (;;) {
    const userOperation = getOneUserOperation({hash})

    if (!userOperation || userOperation.status === 'failed') {
      return
    }

    if (userOperation.status === 'included') {
      return {
        transactionHash: userOperation.transactionHash,
        success: userOperation.success,
      }
    }

    if (userOperation.status !== 'pending') {
      return
    }

    if (!bundlerClient) {
      const network = getNetworkById(networkId)
      const {bundlerEndpoint} = EIP7702_NETWORK_CONFIGS[network.chainId]

      bundlerClient = createBundlerClient({endpoint: bundlerEndpoint})
      pollInterval = Math.min(network.cacheTime || 1000, 4000)
    }

    let receipt

    try {
      receipt = await bundlerClient.getUserOperationReceipt(hash)
    } catch {
      await wait(pollInterval)
      continue
    }

    if (!receipt) {
      await wait(pollInterval)
      continue
    }

    const result = {
      transactionHash: receipt.receipt.transactionHash,
      success: receipt.success,
    }

    // Inclusion and account execution success are separate outcomes.
    setUserOperationIncluded({
      hash,
      transactionHash: result.transactionHash,
      receipt,
      success: result.success,
    })

    return result
  }
}

export const main = async ({
  db: {getOneUserOperation, getNetworkById, setUserOperationIncluded},
  params: {hash, networkId},
}) => {
  const trackerKey = `${networkId}:${hash.toLowerCase()}`
  const activeTracker = activeTrackers.get(trackerKey)

  if (activeTracker) {
    return activeTracker
  }

  const trackingPromise = trackUserOperation({
    getOneUserOperation,
    getNetworkById,
    setUserOperationIncluded,
    hash,
    networkId,
  })

  activeTrackers.set(trackerKey, trackingPromise)

  try {
    return await trackingPromise
  } finally {
    if (activeTrackers.get(trackerKey) === trackingPromise) {
      activeTrackers.delete(trackerKey)
    }
  }
}
