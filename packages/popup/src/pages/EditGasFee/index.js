import {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {useHistory, useLocation} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {
  convertDecimal,
  convertValueToData,
  formatDecimalToHex,
  GWEI_DECIMALS,
} from '@fluent-wallet/data-format'
import Button from '@fluent-wallet/component-button'
import {TitleNav, GasCost} from '../../components'
import {GasStation} from './components'
import {useNetworkTypeIsCfx} from '../../hooks/useApi'
import {
  useCurrentTxParams,
  useIsTxTreatedAsEIP1559,
  useDappParams,
  useEstimateTx,
} from '../../hooks'
import {ROUTES} from '../../constants'
import {getPageType} from '../../utils'

const {EDIT_GAS_FEE} = ROUTES

// resendGasPrice is hex wei
function EditGasFee({
  tx: historyTx,
  isSpeedUp = true,
  resendGasPrice,
  onSubmit,
  resendDisabled,
}) {
  const {t} = useTranslation()
  const history = useHistory()
  const location = useLocation()

  const {
    gasLevel,
    gasLimit,
    advancedGasSetting,
    setGasLevel,
    setGasPrice,
    setMaxFeePerGas,
    setMaxPriorityFeePerGas,
    setGasLimit,
    setNonce,
    tx: txParams,
  } = useCurrentTxParams()

  const isSendTx = location.pathname === EDIT_GAS_FEE

  const isDapp = getPageType() === 'notification'
  const dappTx = useDappParams()
  const originParams = isSendTx
    ? !isDapp
      ? {...txParams}
      : {...dappTx}
    : {...historyTx}

  const estimateRst = useEstimateTx(originParams) || {}
  const {
    gasInfoEip1559 = {},
    gasPrice: estimateGasPrice,
    gasLimit: estimateGasLimit,
  } = estimateRst

  const suggestedGasPrice = resendGasPrice || estimateGasPrice

  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const isTxTreatedAsEIP1559 = useIsTxTreatedAsEIP1559(originParams?.type)

  const [selectedGasLevel, setSelectedGasLevel] = useState('')

  useEffect(() => {
    setSelectedGasLevel(gasLevel)
  }, [gasLevel])

  useEffect(() => {
    if (advancedGasSetting.nonce) setSelectedGasLevel('advanced')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(advancedGasSetting.nonce)])

  let sendParams = {}
  if (selectedGasLevel === 'advanced') {
    sendParams = {...originParams, ...advancedGasSetting}
  } else {
    if (isTxTreatedAsEIP1559) {
      const gasInfo = gasInfoEip1559[selectedGasLevel] || {}
      const {suggestedMaxFeePerGas, suggestedMaxPriorityFeePerGas} = gasInfo
      const maxFeePerGas = convertValueToData(
        suggestedMaxFeePerGas || '0',
        GWEI_DECIMALS,
      )
      const maxPriorityFeePerGas = convertValueToData(
        suggestedMaxPriorityFeePerGas || '0',
        GWEI_DECIMALS,
      )
      sendParams = {
        ...originParams,
        maxFeePerGas,
        maxPriorityFeePerGas,
        gas: formatDecimalToHex(gasLimit),
      }
    } else {
      sendParams = {
        ...originParams,
        gasPrice: suggestedGasPrice,
        gas: formatDecimalToHex(gasLimit),
      }
    }
  }

  const saveGasData = () => {
    const {gasPrice, maxPriorityFeePerGas, maxFeePerGas, nonce, gasLimit} =
      advancedGasSetting

    setGasLevel(selectedGasLevel)

    if (selectedGasLevel === 'advanced') {
      if (isTxTreatedAsEIP1559) {
        setMaxFeePerGas(convertDecimal(maxFeePerGas, 'multiply', GWEI_DECIMALS))
        setMaxPriorityFeePerGas(
          convertDecimal(maxPriorityFeePerGas, 'multiply', GWEI_DECIMALS),
        )
      } else {
        setGasPrice(convertDecimal(gasPrice, GWEI_DECIMALS))
      }
      setNonce(nonce)
      setGasLimit(gasLimit)
    } else {
      if (isTxTreatedAsEIP1559) {
        const gasInfo = gasInfoEip1559[selectedGasLevel] || {}
        const {suggestedMaxFeePerGas, suggestedMaxPriorityFeePerGas} = gasInfo
        setMaxFeePerGas(
          convertDecimal(suggestedMaxFeePerGas, 'multiply', GWEI_DECIMALS),
        )
        setMaxPriorityFeePerGas(
          convertDecimal(
            suggestedMaxPriorityFeePerGas,
            'multiply',
            GWEI_DECIMALS,
          ),
        )
      } else {
        setGasPrice(suggestedGasPrice)
      }
    }
    onSubmit && onSubmit()
    history.goBack()
  }

  return (
    <div
      id="editGasFeeContainer"
      className="h-full w-full flex flex-col bg-blue-circles bg-no-repeat bg-0 pb-6"
    >
      <div className="flex-1">
        <TitleNav
          title={
            isSendTx ? t('editGasFee') : isSpeedUp ? t('speedUp') : t('cancel')
          }
        />
        <main className="mt-3 px-4 flex flex-col flex-1">
          <GasCost
            sendParams={sendParams}
            networkTypeIsCfx={networkTypeIsCfx}
          />
          <GasStation
            isTxTreatedAsEIP1559={isTxTreatedAsEIP1559}
            gasInfoEip1559={gasInfoEip1559}
            suggestedGasPrice={suggestedGasPrice}
            selectedGasLevel={selectedGasLevel}
            setSelectedGasLevel={setSelectedGasLevel}
            networkTypeIsCfx={networkTypeIsCfx}
            estimateGasLimit={estimateGasLimit}
          />
        </main>
      </div>
      <footer className="flex flex-col px-4">
        {!isSendTx && (
          <div className="bg-warning-10 text-warning px-3 py-2 mb-3 text-xs rounded-sm">
            {isSpeedUp ? t('speedupTxDes') : t('cancelTxDes')}
          </div>
        )}
        <Button
          className="w-full mx-auto"
          id="saveGasFeeBtn"
          onClick={saveGasData}
          disabled={
            (isTxTreatedAsEIP1559 && !gasInfoEip1559[selectedGasLevel]) ||
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
  isSpeedUp: PropTypes.bool,
  tx: PropTypes.object,
  resendGasPrice: PropTypes.string,
  resendDisabled: PropTypes.bool,
}

export default EditGasFee
