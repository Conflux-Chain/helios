import {bn16} from './index'

export const NATIVE_TOKEN_BALANCE_KEY = '0x0'

export function getTokenBalanceKey(tokenAddress) {
  return tokenAddress ? tokenAddress.toLowerCase() : NATIVE_TOKEN_BALANCE_KEY
}

/**
 * Returns whether a gas token can cover gas after the current send amount.
 * Empty gasPaymentAmount means the token has no usable estimate.
 */
export function canTokenPayGas({
  gasTokenBalanceKey,
  sendTokenBalanceKey,
  sendAmount,
  gasTokenBalance,
  gasPaymentAmount,
}) {
  if (!gasPaymentAmount) return false

  const occupiedAmount =
    gasTokenBalanceKey === sendTokenBalanceKey ? bn16(sendAmount) : bn16('0x0')

  return bn16(gasTokenBalance).sub(occupiedAmount).gte(bn16(gasPaymentAmount))
}

export function getUserPaidNativeGasFee(estimateRst) {
  const {
    willPayCollateral,
    willPayTxFee,
    storageFeeDrip,
    gasFeeDrip,
    txFeeDrip,
  } = estimateRst || {}

  const isStorageSponsored = willPayCollateral === false
  const isGasSponsored = willPayTxFee === false

  // If both storage collateral and gas fee are sponsored, user pays no native gas fee.
  if (isStorageSponsored && isGasSponsored) return '0x0'

  // If nothing is sponsored, user pays the full estimated transaction fee.
  if (!isStorageSponsored && !isGasSponsored) return txFeeDrip

  // If only one part is sponsored, user pays the other part.
  return isStorageSponsored ? gasFeeDrip : storageFeeDrip
}
