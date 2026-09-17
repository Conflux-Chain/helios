import {ETH_TX_TYPES} from '@fluent-wallet/consts'
import {encodeAccountCalls} from '@fluent-wallet/user-operation'

export function buildCallBundleTransaction({
  from,
  chainId,
  calls,
  authorizationAddress,
}) {
  // Send a single call directly.
  if (calls.length === 1) {
    const [call] = calls

    return {
      type: ETH_TX_TYPES.EIP1559,
      from,
      chainId,
      to: call.to,
      value: call.value,
      data: call.data,
    }
  }

  const transaction = {
    type: authorizationAddress ? ETH_TX_TYPES.EIP7702 : ETH_TX_TYPES.EIP1559,
    from,
    chainId,
    to: from,
    value: '0x0',
    data: encodeAccountCalls(calls),
  }

  if (authorizationAddress) {
    transaction.authorizationList = [{address: authorizationAddress}]
  }

  return transaction
}
