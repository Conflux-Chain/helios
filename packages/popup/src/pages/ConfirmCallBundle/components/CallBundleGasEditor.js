import {useState} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {formatHexToDecimal} from '@fluent-wallet/data-format'
import AdvancedGasEditor from '../../../components/AdvancedGasEditor'
import GasCost from '../../../components/GasCost'
import GasFeeOptions from '../../../components/GasFeeOptions'
import {NETWORK_TYPE} from '../../../constants'
import {useCallBundleEstimate} from '../useCallBundleEstimate'
import {getSelectedGasLevel} from '../../../utils/gas'
import TitleNav from '../../../components/TitleNav'

function CallBundleGasEditor({
  transaction,
  calls,
  network,
  initialTxOptions = null,
  onSave,
  onClose,
}) {
  const {t} = useTranslation()
  const [txOptions, setTxOptions] = useState(initialTxOptions)
  const [advancedInitialValues, setAdvancedInitialValues] = useState(null)

  const transactionEstimate = useCallBundleEstimate({
    transaction,
    calls,
    network,
    txOptions,
  })

  const {
    data: estimate,
    loading,
    error,
    transaction: currentTx,
  } = transactionEstimate

  const gasLevel = getSelectedGasLevel({
    tx: transaction,
    txOptions,
    uses1559Fees: true,
  })

  const isEditingAdvanced = advancedInitialValues !== null

  const handleSelectGasLevel = gasLevel => {
    setTxOptions(current => ({
      ...current,
      gasLevel,
      maxFeePerGas: '',
      maxPriorityFeePerGas: '',
    }))
  }

  const handleEditAdvancedFees = () => {
    if (!currentTx) {
      return
    }

    setAdvancedInitialValues({
      maxFeePerGas: formatHexToDecimal(currentTx.maxFeePerGas),
      maxPriorityFeePerGas: formatHexToDecimal(currentTx.maxPriorityFeePerGas),
      gasLimit: txOptions?.gasLimit ?? formatHexToDecimal(transaction.gas),
      nonce: txOptions?.nonce || '',
    })
  }

  const handleSaveAdvancedFees = changes => {
    if (Object.keys(changes).length > 0) {
      setTxOptions(current => ({...current, ...changes}))
    }

    setAdvancedInitialValues(null)
  }

  const handleBack = () => {
    if (isEditingAdvanced) {
      setAdvancedInitialValues(null)
    } else {
      onClose()
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-blue-circles bg-no-repeat bg-bg">
      <header className="shrink-0">
        <TitleNav
          title={
            <h1 className="text-center text-sm text-gray-100">
              {t(isEditingAdvanced ? 'advanced' : 'editGasFee')}
            </h1>
          }
          autoGoBack={false}
          onGoBack={handleBack}
        />
      </header>
      {isEditingAdvanced ? (
        <AdvancedGasEditor
          transaction={transaction}
          network={network}
          initialValues={advancedInitialValues}
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
                transaction={currentTx}
                selectedGasLevel={gasLevel}
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
              onClick={() => onSave(txOptions)}
              disabled={!currentTx}
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
  initialTxOptions: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default CallBundleGasEditor
