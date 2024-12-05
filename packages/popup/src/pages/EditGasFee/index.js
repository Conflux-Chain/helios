import {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {useHistory, useLocation} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {
  convertDecimal,
  convertValueToData,
  formatDecimalToHex,
  formatHexToDecimal,
  GWEI_DECIMALS,
  Big,
} from '@fluent-wallet/data-format'
import Button from '@fluent-wallet/component-button'
import {TitleNav, GasCost} from '../../components'
import {GasStation} from './components'
import {useNetworkTypeIsCfx, useIsCfxChain} from '../../hooks/useApi'
import {
  useCurrentTxStore,
  useIsTxTreatedAsEIP1559,
  useDappParams,
  useEstimateTx,
} from '../../hooks'
import {ROUTES} from '../../constants'
import {getPageType} from '../../utils'

const {EDIT_GAS_FEE} = ROUTES

// resendGasPrice is hex wei/drip
function EditGasFee({
  tx: historyTx,
  resendType = '',
  resendGasPrice,
  onSubmit,
  onClickGasStationItem,
  resendDisabled,
}) {
  const {t} = useTranslation()
  const history = useHistory()
  const location = useLocation()

  const {
    gasLevel,
    gasLimit,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    storageLimit,
    advancedGasSetting,
    tx: txParams,
    setGasLevel,
    setGasPrice,
    setMaxFeePerGas,
    setMaxPriorityFeePerGas,
    setGasLimit,
    setStorageLimit,
    setNonce,
    setTx,
    setAdvancedGasSetting,
    clearAdvancedGasSetting,
    clearSendTransactionParams,
  } = useCurrentTxStore()

  const isSendTx = location.pathname === EDIT_GAS_FEE

  const isDapp = getPageType() === 'notification'
  const dappTx = useDappParams()

  const originParams = !isDapp ? {...txParams} : {...dappTx}

  const estimateRst = useEstimateTx(originParams) || {}
  const {
    gasInfoEip1559 = {},
    gasPrice: estimateGasPrice,
    gasLimit: estimateGasLimit,
  } = estimateRst

  // hex wei/drip
  const suggestedGasPrice = resendGasPrice || estimateGasPrice

  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const isCfxChain = useIsCfxChain()
  const isTxTreatedAsEIP1559 = useIsTxTreatedAsEIP1559(originParams?.type)

  const [selectedGasLevel, setSelectedGasLevel] = useState('')

  useEffect(() => {
    if (!isSendTx) {
      setTx(historyTx)
    }
  }, [isSendTx, JSON.stringify(historyTx), setTx])

  useEffect(() => {
    if (advancedGasSetting.gasLevel === 'advanced')
      setSelectedGasLevel('advanced')
    else if (!selectedGasLevel) setSelectedGasLevel(gasLevel)
  }, [advancedGasSetting.gasLevel, gasLevel, selectedGasLevel])

  useEffect(() => {
    if (gasLevel === 'advanced') {
      setAdvancedGasSetting({
        gasLimit: advancedGasSetting.gasLimit || gasLimit,
        gasPrice: advancedGasSetting.gasPrice || gasPrice,
        maxFeePerGas: advancedGasSetting.maxFeePerGas || maxFeePerGas,
        maxPriorityFeePerGas:
          advancedGasSetting.maxPriorityFeePerGas || maxPriorityFeePerGas,
        nonce: advancedGasSetting.nonce || nonce,
        storageLimit: advancedGasSetting.storageLimit || storageLimit,
        gasLevel: 'advanced',
      })
    }
  }, [])

  let sendParams = {}
  if (selectedGasLevel === 'advanced') {
    const {gasPrice, maxFeePerGas, maxPriorityFeePerGas} = advancedGasSetting
    sendParams = {
      ...originParams,
      gas: formatDecimalToHex(advancedGasSetting.gasLimit),
      nonce: formatDecimalToHex(advancedGasSetting.nonce),
      storageLimit: formatDecimalToHex(advancedGasSetting.storageLimit),
      maxFeePerGas: formatDecimalToHex(maxFeePerGas),
      maxPriorityFeePerGas: formatDecimalToHex(maxPriorityFeePerGas),
      gasPrice: formatDecimalToHex(gasPrice),
    }
  } else {
    const gasInfo = gasInfoEip1559[selectedGasLevel] || {}
    const {suggestedMaxFeePerGas, suggestedMaxPriorityFeePerGas} = gasInfo
    sendParams = {
      ...originParams,
      gas: formatDecimalToHex(gasLimit) || estimateGasLimit,
      nonce: formatDecimalToHex(nonce),
      storageLimit: formatDecimalToHex(storageLimit),
      maxFeePerGas: !resendType
        ? suggestedMaxFeePerGas
          ? convertValueToData(
              new Big(suggestedMaxFeePerGas).round(9).toString(10),
              GWEI_DECIMALS,
            )
          : ''
        : // resend use suggest gas price
          suggestedGasPrice,
      maxPriorityFeePerGas: suggestedMaxPriorityFeePerGas
        ? convertValueToData(
            new Big(suggestedMaxPriorityFeePerGas).round(9).toString(10),
            GWEI_DECIMALS,
          )
        : '',
      gasPrice: !isTxTreatedAsEIP1559 ? suggestedGasPrice : '',
    }
  }
  if (!sendParams.maxFeePerGas) delete sendParams.maxFeePerGas
  if (!sendParams.maxPriorityFeePerGas) delete sendParams.maxPriorityFeePerGas
  if (!sendParams.gasPrice) delete sendParams.gasPrice
  if (!sendParams.storageLimit) delete sendParams.storageLimit
  if (!sendParams.nonce) delete sendParams.nonce

  const saveGasData = () => {
    const {
      gasPrice,
      maxPriorityFeePerGas,
      maxFeePerGas,
      nonce,
      gasLimit,
      storageLimit,
    } = advancedGasSetting

    setGasLevel(selectedGasLevel)

    if (selectedGasLevel === 'advanced') {
      if (isTxTreatedAsEIP1559) {
        setMaxFeePerGas(maxFeePerGas)
        setMaxPriorityFeePerGas(maxPriorityFeePerGas)
      } else {
        setGasPrice(gasPrice)
      }
      setNonce(nonce)
      setGasLimit(gasLimit)
      setStorageLimit(storageLimit)
    } else {
      if (isTxTreatedAsEIP1559) {
        const gasInfo = gasInfoEip1559[selectedGasLevel] || {}
        const {suggestedMaxFeePerGas, suggestedMaxPriorityFeePerGas} = gasInfo
        setMaxFeePerGas(
          convertDecimal(
            new Big(suggestedMaxFeePerGas).round(9).toString(10),
            'multiply',
            GWEI_DECIMALS,
          ),
        )
        setMaxPriorityFeePerGas(
          convertDecimal(
            new Big(suggestedMaxPriorityFeePerGas).round(9).toString(10),
            'multiply',
            GWEI_DECIMALS,
          ),
        )
      } else {
        setGasPrice(formatHexToDecimal(suggestedGasPrice))
      }
    }
    if (onSubmit) {
      onSubmit(sendParams)
    } else {
      history.goBack()
    }
  }

  return (
    <div
      id="editGasFeeContainer"
      className="h-full w-full flex flex-col bg-blue-circles bg-no-repeat bg-0 pb-6"
    >
      <div className="flex-1">
        <TitleNav
          onGoBack={() => {
            if (isSendTx) {
              setTimeout(() => clearAdvancedGasSetting(), 500)
            } else {
              setTimeout(() => clearSendTransactionParams(), 500)
            }
          }}
          title={
            isSendTx
              ? t('editGasFee')
              : resendType === 'speedup'
              ? t('speedUp')
              : resendType === 'expeditedCancellation'
              ? t('expeditedCancellation')
              : t('cancel')
          }
        />
        <main className="mt-3 px-4 flex flex-col flex-1">
          <GasCost
            sendParams={sendParams}
            networkTypeIsCfx={networkTypeIsCfx}
          />
          <GasStation
            isTxTreatedAsEIP1559={isTxTreatedAsEIP1559}
            isHistoryTx={!isSendTx}
            gasInfoEip1559={gasInfoEip1559}
            resendType={resendType}
            suggestedGasPrice={suggestedGasPrice}
            selectedGasLevel={selectedGasLevel}
            setSelectedGasLevel={setSelectedGasLevel}
            onClickGasStationItem={onClickGasStationItem}
            isCfxChain={isCfxChain}
            estimateGasLimit={estimateGasLimit}
          />
        </main>
      </div>
      <footer className="flex flex-col px-4">
        {!isSendTx && (
          <div className="bg-warning-10 text-warning px-3 py-2 mb-3 text-xs rounded-sm">
            {resendType === 'speedup' || resendType === 'expeditedCancellation'
              ? t('speedupTxDes')
              : t('cancelTxDes')}
          </div>
        )}
        <Button
          className="w-full mx-auto z-50"
          id="saveGasFeeBtn"
          onClick={saveGasData}
          disabled={
            (isTxTreatedAsEIP1559 &&
              selectedGasLevel !== 'advanced' &&
              !gasInfoEip1559[selectedGasLevel]) ||
            (!isTxTreatedAsEIP1559 && !suggestedGasPrice) ||
            resendDisabled
          }
        >
          {isSendTx ? t('save') : t('submit')}
        </Button>
      </footer>
    </div>
  )
}

EditGasFee.propTypes = {
  onSubmit: PropTypes.func,
  onClickGasStationItem: PropTypes.func,
  isSpeedUp: PropTypes.bool,
  tx: PropTypes.object,
  resendGasPrice: PropTypes.string,
  resendType: PropTypes.string,
  resendDisabled: PropTypes.bool,
}

export default EditGasFee
