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

const activeTrackers = new Set()

export const main = async ({
  db: {getOneUserOperation, getNetworkById, setUserOperationIncluded},
  params: {hash, networkId},
}) => {
  const trackerKey = `${networkId}:${hash.toLowerCase()}`
  if (activeTrackers.has(trackerKey)) return

  activeTrackers.add(trackerKey)

  const stopTracking = () => activeTrackers.delete(trackerKey)

  const poll = async () => {
    const userOperation = getOneUserOperation({hash})

    if (
      !userOperation ||
      userOperation.status === 'included' ||
      userOperation.status === 'failed'
    ) {
      stopTracking()
      return
    }

    const network = getNetworkById(networkId)
    const {bundlerEndpoint} = EIP7702_NETWORK_CONFIGS[network.chainId]
    const bundlerClient = createBundlerClient({endpoint: bundlerEndpoint})
    const pollInterval = Math.min(network.cacheTime || 1000, 4000)
    const pollAgain = () => {
      setTimeout(() => {
        void poll().catch(stopTracking)
      }, pollInterval)
    }

    let userOperationReceipt

    try {
      userOperationReceipt = await bundlerClient.getUserOperationReceipt(hash)
    } catch {
      pollAgain()
      return
    }

    if (!userOperationReceipt) {
      pollAgain()
      return
    }

    // A receipt means the operation was included even when account execution reverted.
    setUserOperationIncluded({
      hash,
      transactionHash: userOperationReceipt.receipt.transactionHash,
      receipt: userOperationReceipt,
      success: userOperationReceipt.success,
    })
    stopTracking()
  }

  try {
    await poll()
  } catch (error) {
    stopTracking()
    throw error
  }
}
