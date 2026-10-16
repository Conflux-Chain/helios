import {ethGetFeeData} from '@fluent-wallet/estimate-tx'
import {applyTxOptions} from '../../utils/gas'
import {useTransactionEstimate} from '../../hooks/useTransactionEstimate'
import {bn16} from '../../utils'

export function useCallBundleEstimate({
  transaction,
  calls,
  network,
  txOptions,
}) {
  const baseEstimate = useTransactionEstimate({
    transaction,
    network,
  })

  const transactionWithGas = applyTxOptions({
    tx: transaction,
    txOptions,
    estimate: baseEstimate.data,
    uses1559Fees: true,
  })

  const hasGasPrices = Boolean(
    transactionWithGas.maxFeePerGas && transactionWithGas.maxPriorityFeePerGas,
  )

  const selectedTransaction =
    transaction && hasGasPrices ? transactionWithGas : null

  const editedEstimate = useTransactionEstimate({
    transaction: txOptions ? selectedTransaction : null,
    network,
  })

  const currentEstimate = txOptions ? editedEstimate : baseEstimate
  const error =
    currentEstimate.error ||
    (!selectedTransaction ? baseEstimate.error : undefined)

  const loading =
    Boolean(transaction) &&
    !error &&
    (!selectedTransaction || currentEstimate.loading)

  const estimate = !loading && !error ? currentEstimate.data : undefined

  const finalTransaction = selectedTransaction
    ? {
        ...selectedTransaction,
        gas: selectedTransaction.gas || estimate?.gasLimit,
      }
    : null

  let data

  if (estimate && finalTransaction) {
    const totalCallValue = calls.reduce(
      (total, call) => total.add(bn16(call.value)),
      bn16('0x0'),
    )

    // Calculate fees using the parameters that will actually be submitted.
    const feeData = ethGetFeeData(
      {
        gas: finalTransaction.gas,
        gasPrice: finalTransaction.maxFeePerGas,
        value: `0x${totalCallValue.toString(16)}`,
      },
      {
        balance: estimate.balanceDrip,
      },
    )

    data = {
      ...estimate,
      ...feeData,
    }
  }

  return {
    data,
    loading,
    error,
    transaction: finalTransaction,
    // After estimation fails, keep current edits available for simulation and
    // leave missing gas unset. This fallback does not imply readiness to send.
    simulationTransaction:
      finalTransaction || (transaction ? transactionWithGas : null),
    gasInfoEip1559: baseEstimate.data?.gasInfoEip1559,
    suggestedNonce: baseEstimate.data?.nonce,
  }
}
