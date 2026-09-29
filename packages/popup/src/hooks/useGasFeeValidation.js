import {useTranslation} from 'react-i18next'
import {Big} from '@fluent-wallet/data-format'

// Fee inputs use GWei/GDrip. Gas limits and nonce use decimal strings.
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

  const errors = {
    gasPrice: '',
    maxPriorityFeePerGas: '',
    gasLimit: '',
    nonce: '',
  }

  if (uses1559Fees) {
    const priorityFee = new Big(maxPriorityFeePerGas || '0')

    if (priorityFee.lte(0)) {
      errors.maxPriorityFeePerGas = t('maxPriorityFeePerGasLowErr', {
        amount: 0.000000001,
        unit: 'GWei',
      })
    } else if (priorityFee.gt(maxFeePerGas || '0')) {
      errors.maxPriorityFeePerGas = t('maxPriorityFeePerGasHighErr')
    }
  } else if (new Big(gasPrice || '0').lte(0)) {
    errors.gasPrice = t('gasPriceErr', {
      amount: isCfxChain ? 1 : 0.000000001,
      unit: isCfxChain ? 'GDrip' : 'GWei',
    })
  }

  if (gasLimit) {
    const limit = new Big(gasLimit)

    if (limit.lt(minGasLimit)) {
      errors.gasLimit = t('gasLimitMinErr', {
        gasUsed: minGasLimit,
      })
    } else if (maxGasLimit && limit.gt(maxGasLimit)) {
      errors.gasLimit = t('gasLimitMaxErr', {
        gasMax: maxGasLimit,
      })
    }
  }

  if (canEditNonce && nonce && new Big(nonce).lt(0)) {
    errors.nonce = t('nonceErr')
  }

  return errors
}
