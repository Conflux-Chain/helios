import {base32UserAddress, cat} from '@fluent-wallet/spec'
import {decodeCfxRawTransaction} from '@fluent-wallet/signature'
import {toHexQuantity} from '@fluent-wallet/utils'

export const NAME = 'wallet_getConfluxNonceState'

export const schemas = {
  input: [cat, base32UserAddress],
}

export const permissions = {
  locked: true,
  methods: ['txpool_nextNonce', 'cfx_getNextNonce'],
  db: ['getUnfinishedTx', 'getTxById'],
}

export const main = async ({
  db: {getUnfinishedTx, getTxById},
  rpcs: {txpool_nextNonce, cfx_getNextNonce},
  params: [address],
}) => {
  const lowercaseAddress = address.toLowerCase()
  const occupiedNonces = []

  for (const {
    tx,
    address: txAddress,
    network: txNetwork,
  } of getUnfinishedTx()) {
    if (
      txNetwork.type !== 'cfx' ||
      txAddress.value.toLowerCase() !== lowercaseAddress
    ) {
      continue
    }

    const storedTx = getTxById(tx)
    if (!storedTx?.fromFluent || !storedTx.raw) continue

    const transaction = decodeCfxRawTransaction(storedTx.raw)

    if (transaction.from.toLowerCase() !== lowercaseAddress) {
      throw new Error(`Stored transaction ${tx} has an unexpected sender`)
    }

    occupiedNonces.push(toHexQuantity(transaction.nonce))
  }

  let networkPendingNonce

  try {
    networkPendingNonce = await txpool_nextNonce({errorFallThrough: true}, [
      address,
    ])
  } catch (err) {
    networkPendingNonce = await cfx_getNextNonce(
      {
        errorFallThrough: true,
        _cacheConf: {type: null},
      },
      [address],
    )
  }

  return {
    networkPendingNonce,
    occupiedNonces,
  }
}
