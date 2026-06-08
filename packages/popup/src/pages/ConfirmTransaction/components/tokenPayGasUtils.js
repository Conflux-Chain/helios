import {convertDataToValue, roundBalance} from '@fluent-wallet/data-format'

export function getTokenIcon(token) {
  return token?.logoURI || token?.icon || token?.iconUrls?.[0]
}

export function getNativeGasFee(estimateRst) {
  const {
    willPayCollateral,
    willPayTxFee,
    storageFeeDrip,
    gasFeeDrip,
    txFeeDrip,
  } = estimateRst || {}

  const isBePayed = willPayCollateral === false || willPayTxFee === false
  const isBeAllPayed = willPayCollateral === false && willPayTxFee === false

  if (isBeAllPayed) return '0x0'
  if (!isBePayed) return txFeeDrip
  return willPayCollateral === false ? gasFeeDrip : storageFeeDrip
}

export function formatTokenAmount(value, decimals) {
  if (!value || decimals === undefined || decimals === null) return ''
  return roundBalance(convertDataToValue(value, decimals))
}

export function formatQuoteAmount(value, quoteToken) {
  const amount = formatTokenAmount(value, quoteToken?.decimals)
  return amount ? `≈$ ${amount}` : ''
}

export function getBalanceByAddress(balances, address) {
  return balances?.[address?.toLowerCase()] || balances?.[address]
}
