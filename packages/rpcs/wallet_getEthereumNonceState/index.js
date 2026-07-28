import {cat, ethHexAddress} from '@fluent-wallet/spec'
import {toHexQuantity} from '@fluent-wallet/utils'

export const NAME = 'wallet_getEthereumNonceState'

export const schemas = {
  input: [cat, ethHexAddress],
}

export const permissions = {
  locked: true,
  methods: ['eth_getTransactionCount'],
  db: ['getUnfinishedTx', 'getTxById'],
}

export const main = async ({
  db: {getUnfinishedTx, getTxById},
  rpcs: {eth_getTransactionCount},
  params: [address],
  network,
}) => {
  const {chainId} = network
  const lowercaseAddress = address.toLowerCase()

  const occupiedNonces = []

  for (const {
    tx,
    address: txAddress,
    network: txNetwork,
  } of getUnfinishedTx()) {
    if (
      txNetwork.type !== 'eth' ||
      txNetwork.chainId !== chainId ||
      txAddress.value.toLowerCase() !== lowercaseAddress
    ) {
      continue
    }

    const storedTx = getTxById(tx)
    const txPayload = storedTx?.txPayload
    if (
      !storedTx?.fromFluent ||
      typeof txPayload?.from !== 'string' ||
      txPayload.from.toLowerCase() !== lowercaseAddress ||
      txPayload.nonce === undefined
    ) {
      continue
    }

    occupiedNonces.push(toHexQuantity(txPayload.nonce))

    for (const authorizationRecord of txPayload.authorizationList ?? []) {
      const authorization =
        authorizationRecord?.eip7702Authorization ?? authorizationRecord
      if (authorization?.nonce !== undefined) {
        occupiedNonces.push(toHexQuantity(authorization.nonce))
      }
    }
  }
  const networkPendingNonce = await eth_getTransactionCount(
    {
      errorFallThrough: true,
      _cacheConf: {type: null},
    },
    [address, 'pending'],
  )

  return {
    networkPendingNonce,
    occupiedNonces,
  }
}
