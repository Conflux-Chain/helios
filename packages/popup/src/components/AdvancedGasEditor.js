import {useState} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {
  convertDecimal,
  convertValueToData,
  formatDecimalToHex,
  formatHexToDecimal,
  GWEI_DECIMALS,
} from '@fluent-wallet/data-format'
import {NETWORK_TYPE} from '../constants'
import {useTransactionEstimate} from '../hooks/useTransactionEstimate'
import {useGasFeeValidation} from '../hooks/useGasFeeValidation'
import GasCost from './GasCost'
import GasPriceFields from './GasPriceFields'
import GasAndNonceFields from './GasAndNonceFields'

// initialValues and onSave use base-unit decimal strings.
function AdvancedGasEditor({
  transaction,
  network,
  initialValues,
  uses1559Fees,
  suggestedNonce,
  maxGasLimit,
  canEditNonce = true,
  onSave,
}) {
  const {t} = useTranslation()
  const networkTypeIsCfx = network.type === NETWORK_TYPE.CFX
  const isCfxChain =
    networkTypeIsCfx ||
    network.ticker.symbol?.toLowerCase() === NETWORK_TYPE.CFX

  const [values, setValues] = useState(() => ({
    gasPrice: convertDecimal(
      initialValues.gasPrice || '',
      'divide',
      GWEI_DECIMALS,
    ),
    maxFeePerGas: convertDecimal(
      initialValues.maxFeePerGas || '',
      'divide',
      GWEI_DECIMALS,
    ),
    maxPriorityFeePerGas: convertDecimal(
      initialValues.maxPriorityFeePerGas || '',
      'divide',
      GWEI_DECIMALS,
    ),
    gasLimit: '',
    nonce: canEditNonce ? initialValues.nonce || '' : '',
  }))

  const gasLimit = values.gasLimit || initialValues.gasLimit

  const transactionForEstimate = {
    ...transaction,
    gas: formatDecimalToHex(gasLimit),
    storageLimit: networkTypeIsCfx
      ? formatDecimalToHex(initialValues.storageLimit)
      : undefined,
    nonce: canEditNonce ? formatDecimalToHex(values.nonce) : transaction.nonce,
    gasPrice: uses1559Fees
      ? undefined
      : convertValueToData(values.gasPrice, GWEI_DECIMALS),
    maxFeePerGas: uses1559Fees
      ? convertValueToData(values.maxFeePerGas, GWEI_DECIMALS)
      : undefined,
    maxPriorityFeePerGas: uses1559Fees
      ? convertValueToData(values.maxPriorityFeePerGas, GWEI_DECIMALS)
      : undefined,
  }

  for (const field of [
    'gas',
    'storageLimit',
    'nonce',
    'gasPrice',
    'maxFeePerGas',
    'maxPriorityFeePerGas',
  ]) {
    if (!transactionForEstimate[field]) {
      delete transactionForEstimate[field]
    }
  }

  const {data: estimate, error} = useTransactionEstimate({
    transaction: transactionForEstimate,
    network,
  })

  const resolvedGasLimit = gasLimit || formatHexToDecimal(estimate?.gasLimit)
  const storageLimit =
    initialValues.storageLimit ||
    formatHexToDecimal(estimate?.storageCollateralized)

  const errors = useGasFeeValidation({
    values: {
      ...values,
      gasLimit: resolvedGasLimit,
    },
    uses1559Fees,
    isCfxChain,
    minGasLimit: formatHexToDecimal(estimate?.gasUsed || '21000'),
    maxGasLimit,
    canEditNonce,
  })

  const updateField = (field, value) => {
    setValues(current => ({...current, [field]: value}))
  }

  const handleSave = () => {
    onSave({
      gasPrice: uses1559Fees
        ? ''
        : convertDecimal(values.gasPrice, 'multiply', GWEI_DECIMALS),
      maxFeePerGas: uses1559Fees
        ? convertDecimal(values.maxFeePerGas, 'multiply', GWEI_DECIMALS)
        : '',
      maxPriorityFeePerGas: uses1559Fees
        ? convertDecimal(values.maxPriorityFeePerGas, 'multiply', GWEI_DECIMALS)
        : '',
      gasLimit: resolvedGasLimit,
      storageLimit,
      nonce: canEditNonce
        ? values.nonce
        : formatHexToDecimal(transaction.nonce),
    })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <main className="min-h-0 flex-1 overflow-y-auto px-4 pt-3">
        <GasCost estimate={estimate || {error}} network={network} />

        <GasPriceFields
          isCfxChain={isCfxChain}
          uses1559Fees={uses1559Fees}
          inputGasPrice={values.gasPrice}
          gasPriceErr={errors.gasPrice}
          onChangeGasPrice={value => updateField('gasPrice', value)}
          inputMaxFeePerGas={values.maxFeePerGas}
          onChangeMaxFeePerGas={value => updateField('maxFeePerGas', value)}
          inputMaxPriorityFeePerGas={values.maxPriorityFeePerGas}
          maxPriorityFeePerGasErr={errors.maxPriorityFeePerGas}
          onChangeMaxPriorityFeePerGas={value =>
            updateField('maxPriorityFeePerGas', value)
          }
        />

        <GasAndNonceFields
          showStorageLimit={networkTypeIsCfx}
          canEditNonce={canEditNonce}
          inputGasLimit={values.gasLimit}
          gasLimitErr={errors.gasLimit}
          onChangeGasLimit={value => updateField('gasLimit', value)}
          inputNonce={values.nonce}
          nonceErr={errors.nonce}
          onChangeNonce={value => updateField('nonce', value)}
          storageLimit={storageLimit}
          nonce={
            values.nonce ||
            formatHexToDecimal(estimate?.nonce) ||
            suggestedNonce
          }
          gasLimit={resolvedGasLimit}
        />
      </main>

      <footer className="shrink-0 px-4 pb-6">
        <Button
          className="w-full"
          id="saveAdvancedGasFeeBtn"
          onClick={handleSave}
          disabled={
            !resolvedGasLimit ||
            (networkTypeIsCfx && !storageLimit) ||
            Object.values(errors).some(Boolean)
          }
        >
          {t('save')}
        </Button>
      </footer>
    </div>
  )
}

AdvancedGasEditor.propTypes = {
  transaction: PropTypes.object.isRequired,
  network: PropTypes.object.isRequired,
  initialValues: PropTypes.shape({
    gasPrice: PropTypes.string,
    maxFeePerGas: PropTypes.string,
    maxPriorityFeePerGas: PropTypes.string,
    gasLimit: PropTypes.string,
    storageLimit: PropTypes.string,
    nonce: PropTypes.string,
  }).isRequired,
  uses1559Fees: PropTypes.bool.isRequired,
  suggestedNonce: PropTypes.string,
  maxGasLimit: PropTypes.string,
  canEditNonce: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
}

export default AdvancedGasEditor
