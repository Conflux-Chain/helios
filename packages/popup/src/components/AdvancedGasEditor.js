import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {formatHexToDecimal} from '@fluent-wallet/data-format'
import {NETWORK_TYPE} from '../constants'
import {useGasFeeValidation} from '../hooks/useGasFeeValidation'
import GasCost from './GasCost'
import GasPriceFields from './GasPriceFields'
import GasAndNonceFields from './GasAndNonceFields'

// The parent owns the inputs, transaction, and estimate for both fee views.
function AdvancedGasEditor({
  transaction,
  network,
  values,
  estimate,
  uses1559Fees,
  suggestedNonce,
  maxGasLimit,
  canEditNonce = true,
  onChange,
  onSave,
}) {
  const {t} = useTranslation()
  const networkTypeIsCfx = network.type === NETWORK_TYPE.CFX
  const isCfxChain =
    networkTypeIsCfx ||
    network.ticker.symbol?.toLowerCase() === NETWORK_TYPE.CFX

  const resolvedGasLimit = formatHexToDecimal(transaction?.gas)
  const storageLimit = formatHexToDecimal(transaction?.storageLimit)

  const minGasLimit = formatHexToDecimal(estimate?.estimatedGasLimit)

  const errors = useGasFeeValidation({
    values: {
      ...values,
      gasLimit: resolvedGasLimit,
    },
    uses1559Fees,
    isCfxChain,
    minGasLimit,
    maxGasLimit,
    canEditNonce,
  })

  const priceFields = uses1559Fees
    ? ['maxFeePerGas', 'maxPriorityFeePerGas']
    : ['gasPrice']

  const saveDisabled =
    Boolean(estimate?.error) ||
    minGasLimit === undefined ||
    priceFields.some(field => values[field] === '') ||
    !resolvedGasLimit ||
    (networkTypeIsCfx &&
      (!storageLimit || estimate?.estimatedStorageLimit === undefined)) ||
    Object.values(errors).some(Boolean)

  const handleSave = () => {
    if (saveDisabled) return
    onSave()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <main className="min-h-0 flex-1 overflow-y-auto px-4 pt-3">
        <GasCost estimate={estimate} network={network} />

        <GasPriceFields
          isCfxChain={isCfxChain}
          uses1559Fees={uses1559Fees}
          inputGasPrice={values.gasPrice}
          gasPriceErr={errors.gasPrice}
          onChangeGasPrice={value => onChange('gasPrice', value)}
          inputMaxFeePerGas={values.maxFeePerGas}
          maxFeePerGasErr={errors.maxFeePerGas}
          onChangeMaxFeePerGas={value => onChange('maxFeePerGas', value)}
          inputMaxPriorityFeePerGas={values.maxPriorityFeePerGas}
          maxPriorityFeePerGasErr={errors.maxPriorityFeePerGas}
          onChangeMaxPriorityFeePerGas={value =>
            onChange('maxPriorityFeePerGas', value)
          }
        />

        <GasAndNonceFields
          showStorageLimit={networkTypeIsCfx}
          canEditNonce={canEditNonce}
          inputGasLimit={values.gasLimit ?? resolvedGasLimit ?? ''}
          gasLimitErr={errors.gasLimit}
          onChangeGasLimit={value => onChange('gasLimit', value)}
          inputNonce={values.nonce}
          nonceErr={errors.nonce}
          onChangeNonce={value => onChange('nonce', value)}
          storageLimit={storageLimit}
          nonce={
            values.nonce ||
            formatHexToDecimal(transaction?.nonce || estimate?.nonce) ||
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
          disabled={saveDisabled}
        >
          {t('save')}
        </Button>
      </footer>
    </div>
  )
}

AdvancedGasEditor.propTypes = {
  transaction: PropTypes.object,
  network: PropTypes.object.isRequired,
  values: PropTypes.shape({
    gasPrice: PropTypes.string,
    maxFeePerGas: PropTypes.string,
    maxPriorityFeePerGas: PropTypes.string,
    gasLimit: PropTypes.string,
    nonce: PropTypes.string,
  }).isRequired,
  estimate: PropTypes.object,
  uses1559Fees: PropTypes.bool.isRequired,
  suggestedNonce: PropTypes.string,
  maxGasLimit: PropTypes.string,
  canEditNonce: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
}

export default AdvancedGasEditor
