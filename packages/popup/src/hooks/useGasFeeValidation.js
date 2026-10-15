import {useTranslation} from 'react-i18next'
import {Big} from '@fluent-wallet/data-format'

// Gas limits use decimal strings.
export function getGasLimitError({gasLimit, minGasLimit, maxGasLimit}, t) {
  if (!gasLimit) return ''

  const limit = new Big(gasLimit)

  if (minGasLimit !== undefined && limit.lt(minGasLimit)) {
    return t('gasLimitMinErr', {
      gasUsed: minGasLimit,
    })
  }

  if (maxGasLimit && limit.gt(maxGasLimit)) {
    return t('gasLimitMaxErr', {
      gasMax: maxGasLimit,
    })
  }

  return ''
}

// Fee inputs are GWei/GDrip strings. Gas limits and nonce are integer strings.
export function useGasFeeValidation({
  values,
  uses1559Fees,
  isCfxChain,
  minGasLimit,
  maxGasLimit,
  canEditNonce,
}) {
  const {t} = useTranslation()
  const {gasPrice, maxFeePerGas, maxPriorityFeePerGas, gasLimit, nonce} = values

  // Both Conflux Core Space and eSpace use GDrip.
  const unit = isCfxChain ? 'GDrip' : 'GWei'

  const errors = {
    gasPrice: '',
    maxFeePerGas: '',
    maxPriorityFeePerGas: '',
    gasLimit: getGasLimitError({gasLimit, minGasLimit, maxGasLimit}, t),
    nonce: '',
  }

  if (uses1559Fees) {
    // The form blocks saving empty fee inputs.
    // Zero is only a fallback for comparisons here.
    const maxFee = new Big(maxFeePerGas || '0')
    const priorityFee = new Big(maxPriorityFeePerGas || '0')

    // The fee cap must be positive, even when the priority fee is zero.
    if (maxFeePerGas && maxFee.lte(0)) {
      errors.maxFeePerGas = t('maxFeePerGasLowErr', {unit})
    }

    // The protocol allows a zero priority fee.
    if (priorityFee.lt(0)) {
      errors.maxPriorityFeePerGas = t('maxPriorityFeePerGasLowErr', {
        amount: 0,
        unit,
      })
    } else if (maxFee.gt(0) && priorityFee.gt(maxFee)) {
      // Compare against a valid cap. An invalid cap has its own error above.
      errors.maxPriorityFeePerGas = t('maxPriorityFeePerGasHighErr')
    }
  } else if (new Big(gasPrice || '0').lte(0)) {
    errors.gasPrice = t('gasPriceErr', {
      amount: isCfxChain ? 1 : 0.000000001,
      unit,
    })
  }

  if (canEditNonce && nonce && new Big(nonce).lt(0)) {
    errors.nonce = t('nonceErr')
  }

  return errors
}
