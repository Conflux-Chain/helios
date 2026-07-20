import {cat, ethHexAddress} from '@fluent-wallet/spec'
import {decodeEthRawTransaction} from '@fluent-wallet/signature'

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
    if (!storedTx?.fromFluent || !storedTx.raw) continue

    const transaction = decodeEthRawTransaction(storedTx.raw, chainId)

    if (transaction.from.toLowerCase() !== lowercaseAddress) {
      throw new Error(`Stored transaction ${tx} has an unexpected sender`)
    }
    occupiedNonces.push(transaction.nonce)

    for (const authorization of transaction.authorizationList ?? []) {
      occupiedNonces.push(authorization.nonce)
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
