import {useState} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {
  convertDataToValue,
  formatHexToDecimal,
  GWEI_DECIMALS,
} from '@fluent-wallet/data-format'
import Button from '@fluent-wallet/component-button'
import {TitleNav, GasCost, AlertMessage} from '../../components'
import AdvancedGasEditor from '../../components/AdvancedGasEditor'
import GasFeeOptions from '../../components/GasFeeOptions'
import {useUses1559Fees} from '../../hooks'
import {getGasLimitError} from '../../hooks/useGasFeeValidation'
import {useTransactionEstimate} from '../../hooks/useTransactionEstimate'
import {useAdvancedGasEditor} from '../../hooks/useAdvancedGasEditor'
import {NETWORK_TYPE} from '../../constants'
import {getSelectedGasLevel} from '../../utils/gas'
import {
  useCurrentAddress,
  useCfxMaxGasLimit,
  useIsCfxChain,
} from '../../hooks/useApi'

// resendGasPrice is hex wei/drip
function EditGasFee({
  tx,
  initialTxOptions = {},
  onSave,
  onBack,
  resendType = '',
  resendGasPrice,
  onSubmit,
  onTxOptionsChange,
  resendDisabled,
}) {
  const {t} = useTranslation()
  const {
    data: {network},
  } = useCurrentAddress()

  const networkTypeIsCfx = network.type === NETWORK_TYPE.CFX
  const isCfxChain = useIsCfxChain()
  const uses1559Fees = useUses1559Fees(tx?.type)
  const maxGasLimit = useCfxMaxGasLimit(networkTypeIsCfx)
  const isResend = Boolean(resendType)

  const [txOptions, setTxOptions] = useState(initialTxOptions)
  const advancedGas = useAdvancedGasEditor({uses1559Fees})
  const isEditingAdvanced = advancedGas.isEditing
  const currentTxOptions = advancedGas.draftTxOptions ?? txOptions

  // Replacement transactions use the quote provided by the resend flow.
  const replacementPrice = convertDataToValue(resendGasPrice, GWEI_DECIMALS)
  const replacementFeeSuggestions = isResend
    ? {
        gasPrice: resendGasPrice,
        gasInfoEip1559: {
          medium: {
            suggestedMaxFeePerGas: replacementPrice,
            suggestedMaxPriorityFeePerGas: replacementPrice,
          },
        },
      }
    : undefined

  const effectiveTxOptions = isResend
    ? {gasLevel: 'medium', ...currentTxOptions}
    : currentTxOptions

  const {
    data: feeEstimate,
    loading: estimateLoading,
    error: estimateError,
    feeSuggestions,
    txWithOptions,
    hasGasPrices,
  } = useTransactionEstimate({
    transaction: tx,
    txOptions: effectiveTxOptions,
    feeSuggestions: replacementFeeSuggestions,
    uses1559Fees,
    network,
  })

  const {gasInfoEip1559, gasPrice: suggestedGasPrice} = feeSuggestions || {}

  const selectedGasLevel = getSelectedGasLevel({
    tx,
    txOptions: effectiveTxOptions,
    uses1559Fees,
  })

  const sendParams = feeEstimate?.transaction || txWithOptions

  const estimatedGasLimit = formatHexToDecimal(feeEstimate?.estimatedGasLimit)
  const gasLimitError = hasGasPrices
    ? getGasLimitError(
        {
          gasLimit: formatHexToDecimal(sendParams.gas),
          minGasLimit: estimatedGasLimit,
          maxGasLimit: formatHexToDecimal(maxGasLimit),
        },
        t,
      )
    : ''

  const handleSelectGasLevel = gasLevel => {
    setTxOptions(current => ({
      ...current,
      gasLevel,
      gasPrice: '',
      maxFeePerGas: '',
      maxPriorityFeePerGas: '',
      // Discard gas limit changes from this edit when selecting a preset.
      gasLimit: initialTxOptions.gasLimit,
    }))
    onTxOptionsChange?.()
  }

  const handleEditAdvancedFees = () => {
    if (!hasGasPrices) return

    advancedGas.startEditing({
      currentTx: sendParams,
      txOptions,
    })
  }

  const handleSaveAdvancedFees = () => {
    setTxOptions(advancedGas.draftTxOptions)
    onTxOptionsChange?.()
    advancedGas.reset()
  }

  const canSave = hasGasPrices && !resendDisabled
  const canSubmit =
    canSave &&
    !estimateLoading &&
    !estimateError &&
    Boolean(sendParams.gas) &&
    estimatedGasLimit !== undefined &&
    !gasLimitError &&
    (!networkTypeIsCfx ||
      (sendParams.storageLimit !== undefined &&
        feeEstimate?.estimatedStorageLimit !== undefined))

  const buttonDisabled = isResend ? !canSubmit : !canSave

  const handleSave = () => {
    if (buttonDisabled) return

    if (isResend) {
      onSubmit(sendParams)
    } else {
      onSave(txOptions)
    }
  }

  const handleBack = () => {
    if (isEditingAdvanced) {
      advancedGas.reset()
    } else {
      onBack()
    }
  }

  let titleKey = 'editGasFee'

  if (isEditingAdvanced) {
    titleKey = 'advanced'
  } else if (resendType === 'speedup') {
    titleKey = 'speedUp'
  } else if (resendType === 'expeditedCancellation') {
    titleKey = 'expeditedCancellation'
  } else if (isResend) {
    titleKey = 'cancel'
  }

  return (
    <div
      id="editGasFeeContainer"
      className="flex h-full w-full flex-col bg-blue-circles bg-no-repeat bg-0"
    >
      <div className="shrink-0">
        <TitleNav
          title={t(titleKey)}
          autoGoBack={false}
          onGoBack={handleBack}
        />
      </div>

      {isEditingAdvanced ? (
        <AdvancedGasEditor
          transaction={sendParams}
          network={network}
          values={advancedGas.values}
          estimate={feeEstimate || {error: estimateError}}
          uses1559Fees={uses1559Fees}
          suggestedNonce={formatHexToDecimal(feeEstimate?.nonce)}
          maxGasLimit={formatHexToDecimal(maxGasLimit)}
          canEditNonce={!isResend}
          onChange={advancedGas.updateField}
          onSave={handleSaveAdvancedFees}
        />
      ) : (
        <>
          <main className="mt-3 px-4 flex flex-col flex-1">
            <GasCost
              estimate={feeEstimate || {error: estimateError}}
              network={network}
            />

            <GasFeeOptions
              uses1559Fees={uses1559Fees}
              showFeeLevels={uses1559Fees && !isResend}
              gasInfoEip1559={gasInfoEip1559}
              transaction={sendParams}
              suggestedGasLimit={feeEstimate?.gasLimit}
              suggestedGasPrice={suggestedGasPrice}
              selectedGasLevel={selectedGasLevel}
              isCfxChain={isCfxChain}
              onSelectGasLevel={handleSelectGasLevel}
              onEditAdvancedFees={handleEditAdvancedFees}
            />
          </main>

          {isResend && <AlertMessage inline estimateError={gasLimitError} />}

          <footer className="flex shrink-0 flex-col px-4 pb-6">
            {isResend && (
              <div className="bg-warning-10 text-warning px-3 py-2 mb-3 text-xs rounded-sm">
                {resendType === 'speedup' ||
                resendType === 'expeditedCancellation'
                  ? t('speedupTxDes')
                  : t('cancelTxDes')}
              </div>
            )}

            <Button
              className="w-full mx-auto z-50"
              id="saveGasFeeBtn"
              onClick={handleSave}
              disabled={buttonDisabled}
            >
              {isResend ? t('submit') : t('save')}
            </Button>
          </footer>
        </>
      )}
    </div>
  )
}

EditGasFee.propTypes = {
  tx: PropTypes.object.isRequired,
  initialTxOptions: PropTypes.object,
  onSave: PropTypes.func,
  onBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  onTxOptionsChange: PropTypes.func,
  resendGasPrice: PropTypes.string,
  resendType: PropTypes.string,
  resendDisabled: PropTypes.bool,
}
export default EditGasFee
