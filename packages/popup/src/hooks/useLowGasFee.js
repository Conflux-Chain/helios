import {Big, formatHexToDecimal} from '@fluent-wallet/data-format'
import {useGasFeeSuggestions} from './useGasFeeSuggestions'

export function useLowGasFee({transaction, network, uses1559Fees}) {
  // Use gasPrice as the reference for every transaction type.
  const {data} = useGasFeeSuggestions({network, uses1559Fees: false})
  const suggestedGasPrice = data?.gasPrice
  const feePerGas = uses1559Fees
    ? transaction?.maxFeePerGas
    : transaction?.gasPrice

  if (!feePerGas || !suggestedGasPrice) return false

  return new Big(formatHexToDecimal(feePerGas)).lt(
    formatHexToDecimal(suggestedGasPrice),
  )
}
