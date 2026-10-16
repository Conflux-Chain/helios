import {ethGetFeeData} from '@fluent-wallet/estimate-tx'
import {formatDecimalToHex} from '@fluent-wallet/data-format'
import {applyTxOptions} from '../../utils/gas'
import {useTransactionEstimate} from '../../hooks/useTransactionEstimate'
import {bn16} from '../../utils'

export function useCallBundleEstimate({
  transaction,
  calls,
  network,
  txOptions,
}) {
  // undefined keeps the original nonce; '' lets the estimator choose it.
  const nonce =
    txOptions?.nonce === undefined
      ? transaction?.nonce
      : formatDecimalToHex(txOptions.nonce)

  // The transaction is part of SWR's estimate cache key.
  // Omit limits and prices so editing them reuses the existing estimate.
  // Keep nonce because changing it requires a new estimate.
  const txForEstimate = {
    ...transaction,
    gas: undefined,
    gasPrice: undefined,
    maxFeePerGas: undefined,
    maxPriorityFeePerGas: undefined,
    nonce: nonce || undefined,
  }

  const transactionEstimate = useTransactionEstimate({
    transaction: transaction ? txForEstimate : null,
    network,
  })
  const {data: estimate, error} = transactionEstimate

  // Apply user choices and use the estimate for missing fee prices.
  const txWithOptions = applyTxOptions({
    tx: transaction,
    txOptions,
    estimate,
    uses1559Fees: true,
  })

  const hasGasPrices = Boolean(
    txWithOptions.maxFeePerGas && txWithOptions.maxPriorityFeePerGas,
  )

  const finalTransaction =
    transaction && hasGasPrices
      ? {
          ...txWithOptions,
          gas: txWithOptions.gas || estimate?.gasLimit,
        }
      : null

  const loading =
    Boolean(transaction) &&
    !error &&
    (!finalTransaction || transactionEstimate.loading)

  let data

  if (estimate && finalTransaction) {
    const totalCallValue = calls.reduce(
      (total, call) => total.add(bn16(call.value)),
      bn16('0x0'),
    )

    // Calculate fees and balance using the final transaction parameters.
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
      finalTransaction || (transaction ? txWithOptions : null),
    gasInfoEip1559: estimate?.gasInfoEip1559,
    suggestedGasLimit: estimate?.gasLimit,
    suggestedNonce: estimate?.nonce,
  }
}
