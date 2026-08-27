import {useMemo} from 'react'
import {iface} from '@fluent-wallet/contract-abis/777.js'
import {decode, validateBase32Address} from '@fluent-wallet/base32-address'
import {convertDataToValue} from '@fluent-wallet/data-format'
import {toHexQuantity} from '@fluent-wallet/utils'
import {bn16} from '../../utils'
import {GAS_PAYMENT_METHOD} from '../../constants'

function applyAmountToSendParams({
  params,
  amountHex,
  recipientAddress,
  isNativeAsset,
}) {
  if (isNativeAsset) {
    return {
      ...params,
      value: amountHex,
    }
  }

  if (!recipientAddress) {
    return params
  }

  return {
    ...params,
    data: iface.encodeFunctionData('transfer', [
      validateBase32Address(recipientAddress)
        ? decode(recipientAddress).hexAddress
        : recipientAddress,
      amountHex,
    ]),
  }
}

function getGasCostToDeduct({
  enabled,
  isNativeAsset,
  sendTokenAddress,
  paymentMethod,
  gasTokenAddress,
  nativeCostHex,
  tokenCostHex,
}) {
  if (!enabled) return '0x0'

  // Native max sends must keep enough native balance for native gas.
  if (isNativeAsset && paymentMethod === GAS_PAYMENT_METHOD.NATIVE) {
    return nativeCostHex || '0x0'
  }

  // Token max sends are only reduced when the same token is selected to pay gas.
  if (
    paymentMethod === GAS_PAYMENT_METHOD.TOKEN &&
    !isNativeAsset &&
    sendTokenAddress &&
    sendTokenAddress === gasTokenAddress
  ) {
    return tokenCostHex || '0x0'
  }

  return '0x0'
}

function useAdjustedSendTx({enabled, input, asset, gasPayment}) {
  return useMemo(() => {
    const sendTokenAddress = asset.address?.toLowerCase()
    const gasTokenAddress = gasPayment.tokenAddress?.toLowerCase()
    // The amount page keeps the user's raw max balance. Confirm derives the
    // actual send amount from the currently selected gas payment method.
    const gasCostHex = getGasCostToDeduct({
      enabled,
      isNativeAsset: asset.isNative,
      sendTokenAddress,
      paymentMethod: gasPayment.method,
      gasTokenAddress,
      nativeCostHex: gasPayment.nativeCostHex,
      tokenCostHex: gasPayment.tokenCostHex,
    })
    const gasCostBN = bn16(gasCostHex)
    const adjustedAmountBN = bn16(input.amountHex || '0x0').sub(gasCostBN)
    const hasRemainingAmount = adjustedAmountBN.gt(bn16('0x0'))
    const amountHex = hasRemainingAmount
      ? toHexQuantity(adjustedAmountBN)
      : '0x0'
    const amount = enabled
      ? convertDataToValue(amountHex, asset.decimals)
      : input.amount
    // Keep the adjusted amount local to confirm: update only the tx that will
    // be displayed/submitted, not the send form state.
    const params = enabled
      ? applyAmountToSendParams({
          params: input.params,
          amountHex,
          recipientAddress: input.recipientAddress,
          isNativeAsset: asset.isNative,
        })
      : input.params

    return {
      amount,
      amountHex,
      params,
      gasCostHex,
      isGasCostDeducted: gasCostBN.gt(bn16('0x0')),
      hasRemainingAmount,
    }
  }, [
    asset.address,
    asset.decimals,
    asset.isNative,
    enabled,
    gasPayment.method,
    gasPayment.nativeCostHex,
    gasPayment.tokenAddress,
    gasPayment.tokenCostHex,
    input.amount,
    input.amountHex,
    input.params,
    input.recipientAddress,
  ])
}

export default useAdjustedSendTx
