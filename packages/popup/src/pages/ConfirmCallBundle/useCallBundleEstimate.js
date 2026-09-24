import {ethGetFeeData} from '@fluent-wallet/estimate-tx'
import {
  Big,
  convertValueToData,
  formatDecimalToHex,
  GWEI_DECIMALS,
} from '@fluent-wallet/data-format'
import {useTransactionEstimate} from '../../hooks/useTransactionEstimate'
import {bn16} from '../../utils'

function getGasParameters(settings, estimate) {
  const {
    gasLevel = 'medium',
    gasLimit,
    nonce,
    maxFeePerGas,
    maxPriorityFeePerGas,
  } = settings || {}

  let parameters

  if (gasLevel === 'advanced') {
    parameters = {
      maxFeePerGas: formatDecimalToHex(maxFeePerGas),
      maxPriorityFeePerGas: formatDecimalToHex(maxPriorityFeePerGas),
    }
  } else {
    const fees = estimate?.gasInfoEip1559?.[gasLevel]

    if (!fees) {
      return null
    }

    parameters = {
      maxFeePerGas: convertValueToData(
        new Big(fees.suggestedMaxFeePerGas).round(9).toString(10),
        GWEI_DECIMALS,
      ),
      maxPriorityFeePerGas: convertValueToData(
        new Big(fees.suggestedMaxPriorityFeePerGas).round(9).toString(10),
        GWEI_DECIMALS,
      ),
    }
  }

  if (gasLimit) {
    parameters.gas = formatDecimalToHex(gasLimit)
  }

  if (nonce) {
    parameters.nonce = formatDecimalToHex(nonce)
  }

  return parameters
}

export function useCallBundleEstimate({
  transaction,
  calls,
  network,
  gasSettings,
}) {
  const baseEstimate = useTransactionEstimate({
    transaction,
    network,
  })

  const gasParameters = getGasParameters(gasSettings, baseEstimate.data)
  const selectedTransaction =
    transaction && gasParameters
      ? {
          ...transaction,
          ...gasParameters,
        }
      : null

  const editedEstimate = useTransactionEstimate({
    transaction: gasSettings ? selectedTransaction : null,
    network,
  })

  const currentEstimate = gasSettings ? editedEstimate : baseEstimate
  const error =
    currentEstimate.error ||
    (!selectedTransaction ? baseEstimate.error : undefined)
  const loading =
    Boolean(transaction) &&
    !error &&
    (!selectedTransaction || currentEstimate.loading)
  const estimate = !loading && !error ? currentEstimate.data : undefined

  let data

  if (estimate) {
    const totalCallValue = calls.reduce(
      (total, call) => total.add(bn16(call.value)),
      bn16('0x0'),
    )

    // Include the total call value in the balance check.
    const feeData = ethGetFeeData(
      {
        gas: estimate.gasLimit,
        gasPrice: estimate.customMaxFeePerGas || estimate.maxFeePerGas,
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
    transaction: selectedTransaction
      ? {
          ...selectedTransaction,
          ...(estimate ? {gas: estimate.gasLimit} : {}),
        }
      : null,
    gasInfoEip1559: baseEstimate.data?.gasInfoEip1559,
    suggestedGasLimit: baseEstimate.data?.gasLimit,
    suggestedNonce: baseEstimate.data?.nonce,
  }
}
