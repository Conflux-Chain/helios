import {useTransactionEstimate} from '../../hooks/useTransactionEstimate'
import {bn16} from '../../utils'

export function useCallBundleEstimate({
  transaction,
  calls,
  network,
  txOptions,
}) {
  const totalCallValue = calls.reduce(
    (total, call) => total.add(bn16(call.value)),
    bn16('0x0'),
  )

  const {data, loading, error, feeSuggestions, txWithOptions, hasGasPrices} =
    useTransactionEstimate({
      transaction,
      txOptions,
      network: transaction ? network : null,
      uses1559Fees: true,
      valueForBalance: `0x${totalCallValue.toString(16)}`,
    })

  return {
    data,
    loading,
    error,
    transaction:
      transaction && hasGasPrices ? data?.transaction || txWithOptions : null,
    gasInfoEip1559: feeSuggestions?.gasInfoEip1559,
    suggestedGasLimit: data?.estimatedGasLimit,
    suggestedNonce: data?.nonce,
  }
}
