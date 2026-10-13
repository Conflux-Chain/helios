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
import {NETWORK_TYPE} from '../../constants'
import {applyTxOptions, getSelectedGasLevel} from '../../utils/gas'
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
  const [advancedInitialValues, setAdvancedInitialValues] = useState(null)
  const isEditingAdvanced = advancedInitialValues !== null

  const estimateParams = {...tx}
  delete estimateParams.gas
  delete estimateParams.storageLimit

  const baseEstimate = useTransactionEstimate({
    transaction: estimateParams,
    network,
  })

  // Replacement transactions use the quote provided by the resend flow.
  const replacementPrice = convertDataToValue(resendGasPrice, GWEI_DECIMALS)
  const feeSuggestions = isResend
    ? {
        gasPrice: resendGasPrice,
        gasInfoEip1559: {
          medium: {
            suggestedMaxFeePerGas: replacementPrice,
            suggestedMaxPriorityFeePerGas: replacementPrice,
          },
        },
      }
    : baseEstimate.data

  const {gasInfoEip1559, gasPrice: suggestedGasPrice} = feeSuggestions || {}

  const effectiveTxOptions = isResend
    ? {gasLevel: 'medium', ...txOptions}
    : txOptions

  const txWithOptions = applyTxOptions({
    tx,
    txOptions: effectiveTxOptions,
    estimate: feeSuggestions,
    uses1559Fees,
  })

  const selectedGasLevel = getSelectedGasLevel({
    tx,
    txOptions: effectiveTxOptions,
    uses1559Fees,
  })

  const hasGasPrices =
    uses1559Fees !== undefined &&
    Boolean(
      uses1559Fees
        ? txWithOptions.maxFeePerGas && txWithOptions.maxPriorityFeePerGas
        : txWithOptions.gasPrice,
    )

  const transactionEstimate = useTransactionEstimate({
    transaction: hasGasPrices ? txWithOptions : null,
    network,
  })
  const {data: feeEstimate} = transactionEstimate
  const estimateError = hasGasPrices
    ? transactionEstimate.error
    : baseEstimate.error
  const estimateLoading =
    !estimateError && (!hasGasPrices || transactionEstimate.loading)

  const sendParams = {
    ...txWithOptions,
    gas: txWithOptions.gas || feeEstimate?.gasLimit,
    ...(networkTypeIsCfx
      ? {
          storageLimit:
            txWithOptions.storageLimit || feeEstimate?.storageCollateralized,
        }
      : {}),
  }

  const estimatedGasUsed = formatHexToDecimal(feeEstimate?.gasUsed)
  const gasLimitError = hasGasPrices
    ? getGasLimitError(
        {
          gasLimit: formatHexToDecimal(sendParams.gas),
          minGasLimit: estimatedGasUsed,
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
    }))
    onTxOptionsChange?.()
  }

  const handleEditAdvancedFees = () => {
    if (!hasGasPrices) return

    setAdvancedInitialValues({
      gasPrice: formatHexToDecimal(txWithOptions.gasPrice),
      maxFeePerGas: formatHexToDecimal(txWithOptions.maxFeePerGas),
      maxPriorityFeePerGas: formatHexToDecimal(
        txWithOptions.maxPriorityFeePerGas,
      ),
      gasLimit: formatHexToDecimal(txWithOptions.gas),
      storageLimit: formatHexToDecimal(txWithOptions.storageLimit),
      nonce: txOptions.nonce || '',
    })
  }

  const handleSaveAdvancedFees = changes => {
    if (Object.keys(changes).length > 0) {
      setTxOptions(current => ({...current, ...changes}))
      onTxOptionsChange?.()
    }

    setAdvancedInitialValues(null)
  }

  const canSave = hasGasPrices && !resendDisabled
  const canSubmit =
    canSave &&
    !estimateLoading &&
    !estimateError &&
    Boolean(sendParams.gas) &&
    estimatedGasUsed !== undefined &&
    !gasLimitError &&
    (!networkTypeIsCfx || Boolean(sendParams.storageLimit))
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
      setAdvancedInitialValues(null)
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
          transaction={tx}
          network={network}
          initialValues={advancedInitialValues}
          uses1559Fees={uses1559Fees}
          suggestedNonce={formatHexToDecimal(baseEstimate.data?.nonce)}
          maxGasLimit={formatHexToDecimal(maxGasLimit)}
          canEditNonce={!isResend}
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
