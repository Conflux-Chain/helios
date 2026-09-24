import {useState} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {LeftOutlined} from '@fluent-wallet/component-icons'
import {formatHexToDecimal} from '@fluent-wallet/data-format'
import AdvancedGasEditor from '../../../components/AdvancedGasEditor'
import GasCost from '../../../components/GasCost'
import GasFeeOptions from '../../../components/GasFeeOptions'
import {NETWORK_TYPE} from '../../../constants'
import {useCallBundleEstimate} from '../useCallBundleEstimate'

function CallBundleGasEditor({
  transaction,
  calls,
  network,
  initialGasSettings = null,
  onSave,
  onClose,
}) {
  const {t} = useTranslation()
  const [gasSettings, setGasSettings] = useState(initialGasSettings)
  const [advancedGasValues, setAdvancedGasValues] = useState(null)

  const transactionEstimate = useCallBundleEstimate({
    transaction,
    calls,
    network,
    gasSettings,
  })

  const {data: estimate, loading, error} = transactionEstimate
  const gasLevel = gasSettings?.gasLevel || 'medium'
  const isEditingAdvanced = advancedGasValues !== null

  const handleSelectGasLevel = gasLevel => {
    setGasSettings(current => ({
      gasLevel,
      gasLimit: current?.gasLimit,
      nonce: current?.nonce,
    }))
  }

  const handleEditAdvancedFees = () => {
    const selectedTransaction = transactionEstimate.transaction

    if (!selectedTransaction) {
      return
    }

    setAdvancedGasValues({
      maxFeePerGas: formatHexToDecimal(selectedTransaction.maxFeePerGas),
      maxPriorityFeePerGas: formatHexToDecimal(
        selectedTransaction.maxPriorityFeePerGas,
      ),
      gasLimit: formatHexToDecimal(
        selectedTransaction.gas || transactionEstimate.suggestedGasLimit,
      ),
      nonce: gasSettings?.nonce || '',
    })
  }

  const handleSaveAdvancedFees = settings => {
    setGasSettings({
      gasLevel: 'advanced',
      maxFeePerGas: settings.maxFeePerGas,
      maxPriorityFeePerGas: settings.maxPriorityFeePerGas,
      gasLimit: settings.gasLimit,
      nonce: settings.nonce,
    })
    setAdvancedGasValues(null)
  }

  const handleBack = () => {
    if (isEditingAdvanced) {
      setAdvancedGasValues(null)
    } else {
      onClose()
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-blue-circles bg-no-repeat bg-bg">
      <header className="relative flex h-13 shrink-0 items-center justify-center px-10">
        <button
          type="button"
          aria-label={t('back')}
          onClick={handleBack}
          className="absolute left-3 flex h-5 w-5 items-center justify-center text-gray-60"
        >
          <LeftOutlined className="h-5 w-5" />
        </button>
        <h1 className="text-center text-sm text-gray-100">
          {t(isEditingAdvanced ? 'advanced' : 'editGasFee')}
        </h1>
      </header>

      {isEditingAdvanced ? (
        <AdvancedGasEditor
          transaction={transaction}
          network={network}
          initialValues={advancedGasValues}
          uses1559Fees
          suggestedNonce={formatHexToDecimal(
            transactionEstimate.suggestedNonce,
          )}
          onSave={handleSaveAdvancedFees}
        />
      ) : (
        <>
          <main className="min-h-0 flex-1 overflow-y-auto px-4 pt-3">
            <GasCost estimate={estimate || {error}} network={network} />

            {(loading ||
              transactionEstimate.gasInfoEip1559 ||
              gasLevel === 'advanced') && (
              <GasFeeOptions
                uses1559Fees
                gasInfoEip1559={transactionEstimate.gasInfoEip1559}
                gasLimit={transactionEstimate.transaction?.gas}
                selectedGasLevel={gasLevel}
                advancedGasSetting={gasSettings}
                isCfxChain={
                  network.ticker.symbol?.toLowerCase() === NETWORK_TYPE.CFX
                }
                onSelectGasLevel={handleSelectGasLevel}
                onEditAdvancedFees={handleEditAdvancedFees}
              />
            )}
          </main>

          <footer className="shrink-0 px-4 pb-6">
            <Button
              className="w-full"
              onClick={() => onSave(gasSettings)}
              disabled={
                gasLevel !== 'advanced' &&
                !transactionEstimate.gasInfoEip1559?.[gasLevel]
              }
            >
              {t('save')}
            </Button>
          </footer>
        </>
      )}
    </div>
  )
}

CallBundleGasEditor.propTypes = {
  transaction: PropTypes.object.isRequired,
  calls: PropTypes.array.isRequired,
  network: PropTypes.object.isRequired,
  initialGasSettings: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default CallBundleGasEditor
