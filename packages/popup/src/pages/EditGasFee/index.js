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
import {useCurrentTxStore, useUses1559Fees, useEstimateTx} from '../../hooks'
import {ROUTES} from '../../constants'
import {getPageType} from '../../utils'
import {
  useCurrentAddress,
  useNetworkTypeIsCfx,
  useIsCfxChain,
  usePendingAuthReq,
  usePrepareTokenPayQuote,
  useTokenPayConfig,
} from '../../hooks/useApi'

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
    nonce: suggestedNonce,
    customNonce,
    storageLimit,
    advancedGasSetting,
    gasTokenAddress,
    tx: txParams,
    setGasLevel,
    setGasPrice,
    setMaxFeePerGas,
    setMaxPriorityFeePerGas,
    setGasLimit,
    setStorageLimit,
    setTx,
    setAdvancedGasSetting,
    clearAdvancedGasSetting,
    clearSendTransactionParams,
  } = useCurrentTxStore()

  const isSendTx = location.pathname === EDIT_GAS_FEE

  const nonce =
    !isSendTx && historyTx?.nonce
      ? formatHexToDecimal(historyTx.nonce)
      : customNonce || suggestedNonce

  const isDapp = getPageType() === 'notification'
  const pendingAuthReq = usePendingAuthReq()
  const dappAuthReq = isDapp ? pendingAuthReq?.[0] : null
  const dappTx = dappAuthReq?.req?.params?.[0] || {}
  const dappApp = dappAuthReq?.app

  const {
    data: {network: currentNetwork = {}, account: currentAccount = {}} = {},
  } = useCurrentAddress()

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
  const uses1559Fees = useUses1559Fees(originParams?.type)
  const isTokenPayGas = isSendTx && Boolean(gasTokenAddress)

  const [selectedGasLevel, setSelectedGasLevel] = useState('')
  const effectiveSelectedGasLevel =
    isTokenPayGas && selectedGasLevel === 'advanced'
      ? 'medium'
      : selectedGasLevel

  useEffect(() => {
    if (!isSendTx) {
      setTx(historyTx)
    }
  }, [isSendTx, JSON.stringify(historyTx), setTx])

  useEffect(() => {
    if (isTokenPayGas && selectedGasLevel === 'advanced') {
      clearAdvancedGasSetting()
      setSelectedGasLevel('medium')
    } else if (!isTokenPayGas && advancedGasSetting.gasLevel === 'advanced')
      setSelectedGasLevel('advanced')
    else if (!selectedGasLevel)
      setSelectedGasLevel(
        isTokenPayGas && gasLevel === 'advanced' ? 'medium' : gasLevel,
      )
  }, [
    advancedGasSetting.gasLevel,
    clearAdvancedGasSetting,
    gasLevel,
    isTokenPayGas,
    selectedGasLevel,
  ])

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
  if (effectiveSelectedGasLevel === 'advanced') {
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
    const gasInfo = gasInfoEip1559[effectiveSelectedGasLevel] || {}
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
        : // 1559 tx resend maxFeePerGas use suggest gas price
          suggestedGasPrice,
      maxPriorityFeePerGas: !resendType
        ? suggestedMaxPriorityFeePerGas
          ? convertValueToData(
              new Big(suggestedMaxPriorityFeePerGas).round(9).toString(10),
              GWEI_DECIMALS,
            )
          : ''
        : // 1559 tx resend maxPriorityFeePerGas use suggest gas price
          suggestedGasPrice,
      gasPrice: !uses1559Fees ? suggestedGasPrice : '',
    }
  }
  if (!sendParams.maxFeePerGas) delete sendParams.maxFeePerGas
  if (!sendParams.maxPriorityFeePerGas) delete sendParams.maxPriorityFeePerGas
  if (!sendParams.gasPrice) delete sendParams.gasPrice
  if (!sendParams.storageLimit) delete sendParams.storageLimit
  if (!sendParams.nonce) delete sendParams.nonce

  const tokenPayNetworkDbId = isDapp
    ? dappApp?.currentNetwork?.eid
    : currentNetwork?.eid

  const tokenPayAccountId = isDapp
    ? dappApp?.currentAccount?.eid
    : currentAccount?.eid

  const {data: tokenPayConfig} = useTokenPayConfig(
    isTokenPayGas ? tokenPayNetworkDbId : undefined,
  )

  const selectedGasToken = tokenPayConfig?.tokens?.find(
    token => token.address?.toLowerCase() === gasTokenAddress?.toLowerCase(),
  )

  const canQuoteTokenPayGas = Boolean(
    isTokenPayGas &&
      sendParams?.gas &&
      effectiveSelectedGasLevel &&
      gasTokenAddress,
  )

  const {data: tokenPayQuote} = usePrepareTokenPayQuote({
    networkDbId: tokenPayNetworkDbId,
    accountId: tokenPayAccountId,
    userTx: canQuoteTokenPayGas ? sendParams : null,
    gasTokenAddress,
    gasLevel: effectiveSelectedGasLevel,
  })

  const displayGasToken = tokenPayQuote?.gasToken || selectedGasToken

  const tokenPayGasCost = isTokenPayGas
    ? {
        balance: tokenPayQuote?.tokenCost || '',
        symbol: displayGasToken?.symbol || '',
        decimals: displayGasToken?.decimals,
      }
    : null

  const saveGasData = () => {
    const {
      gasPrice,
      maxPriorityFeePerGas,
      maxFeePerGas,
      gasLimit,
      storageLimit,
    } = advancedGasSetting

    setGasLevel(effectiveSelectedGasLevel)

    if (effectiveSelectedGasLevel === 'advanced') {
      if (uses1559Fees) {
        setMaxFeePerGas(maxFeePerGas)
        setMaxPriorityFeePerGas(maxPriorityFeePerGas)
      } else {
        setGasPrice(gasPrice)
      }
      setGasLimit(gasLimit)
      setStorageLimit(storageLimit)
    } else {
      if (uses1559Fees) {
        const gasInfo = gasInfoEip1559[effectiveSelectedGasLevel] || {}
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
            displayFee={tokenPayGasCost}
          />
          <GasStation
            uses1559Fees={uses1559Fees}
            isTokenPayGas={isTokenPayGas}
            isHistoryTx={!isSendTx}
            gasInfoEip1559={gasInfoEip1559}
            resendType={resendType}
            suggestedGasPrice={suggestedGasPrice}
            selectedGasLevel={effectiveSelectedGasLevel}
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
            (uses1559Fees &&
              effectiveSelectedGasLevel !== 'advanced' &&
              !gasInfoEip1559[effectiveSelectedGasLevel]) ||
            (!uses1559Fees && !suggestedGasPrice) ||
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
