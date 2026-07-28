import {ETH_TX_TYPES} from '@fluent-wallet/consts'
import {toHexQuantity} from '@fluent-wallet/utils'

const toAuthorizationRequest = ({chainId, address, nonce}) => ({
  chainId: toHexQuantity(chainId),
  address,
  nonce: toHexQuantity(nonce),
})

const getAuthorization = authorizationRecord =>
  authorizationRecord?.eip7702Authorization ?? authorizationRecord

export function buildEthereumReplacementTransaction({
  action,
  originalTransaction,
  gas,
  gasPrice,
  maxFeePerGas,
  maxPriorityFeePerGas,
}) {
  const originalType = originalTransaction.type
  const type =
    action === 'cancel' && originalType === ETH_TX_TYPES.EIP7702
      ? ETH_TX_TYPES.EIP1559
      : originalType

  const transaction = {
    type,
    from: originalTransaction.from,
    chainId: originalTransaction.chainId,
    nonce: originalTransaction.nonce,
    gas: gas ?? originalTransaction.gas ?? originalTransaction.gasLimit,
  }

  if (type === ETH_TX_TYPES.LEGACY || type === ETH_TX_TYPES.EIP2930) {
    transaction.gasPrice = gasPrice ?? originalTransaction.gasPrice
  } else {
    transaction.maxFeePerGas = maxFeePerGas ?? originalTransaction.maxFeePerGas
    transaction.maxPriorityFeePerGas =
      maxPriorityFeePerGas ?? originalTransaction.maxPriorityFeePerGas
  }

  if (action === 'cancel') {
    return {
      ...transaction,
      to: originalTransaction.from,
      value: '0x0',
      data: '0x',
    }
  }

  if (originalTransaction.to) {
    transaction.to = originalTransaction.to
  }

  transaction.value = originalTransaction.value
  transaction.data = originalTransaction.data

  if (originalTransaction.accessList !== undefined) {
    transaction.accessList = originalTransaction.accessList
  }

  if (originalTransaction.authorizationList?.length) {
    transaction.authorizationList = originalTransaction.authorizationList.map(
      authorizationRecord =>
        toAuthorizationRequest(getAuthorization(authorizationRecord)),
    )
  }

  return transaction
}
