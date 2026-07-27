import {ETH_TX_TYPES} from '@fluent-wallet/consts'
import {encode as encodeCfxAddress} from '@fluent-wallet/base32-address'
import {toHexQuantity} from '@fluent-wallet/utils'

export function buildConfluxReplacementTransaction({
  action,
  originalTransaction,
  gas,
  gasPrice,
  storageLimit,
  maxFeePerGas,
  maxPriorityFeePerGas,
}) {
  const type = toHexQuantity(originalTransaction.type)

  const transaction = {
    type,
    from: originalTransaction.from,
    chainId: toHexQuantity(originalTransaction.chainId),
    nonce: toHexQuantity(originalTransaction.nonce),
    gas: gas ?? toHexQuantity(originalTransaction.gas),
    storageLimit:
      storageLimit ?? toHexQuantity(originalTransaction.storageLimit),
  }

  if (type === ETH_TX_TYPES.LEGACY || type === ETH_TX_TYPES.EIP2930) {
    transaction.gasPrice =
      gasPrice ?? toHexQuantity(originalTransaction.gasPrice)
  } else {
    transaction.maxFeePerGas =
      maxFeePerGas ?? toHexQuantity(originalTransaction.maxFeePerGas)
    transaction.maxPriorityFeePerGas =
      maxPriorityFeePerGas ??
      toHexQuantity(originalTransaction.maxPriorityFeePerGas)
  }

  if (action === 'cancel') {
    return {
      ...transaction,
      to: originalTransaction.from,
      value: '0x0',
    }
  }

  if (originalTransaction.to) {
    transaction.to = originalTransaction.to
  }

  transaction.value = toHexQuantity(originalTransaction.value)
  transaction.data = originalTransaction.data

  if (originalTransaction.accessList !== undefined) {
    transaction.accessList = originalTransaction.accessList.entries.map(
      ({address, storageKeys}) => ({
        address: encodeCfxAddress(address, originalTransaction.chainId),
        storageKeys,
      }),
    )
  }

  return transaction
}
