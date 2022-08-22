import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {
  formatHexToDecimal,
  convertDataToValue,
  convertValueToData,
} from '@fluent-wallet/data-format'
import Button from '@fluent-wallet/component-button'
import useInputErrorAnimation from '@fluent-wallet/component-input/useAnimation'
import Alert from '@fluent-wallet/component-alert'
import txHistoryChecker from '@fluent-wallet/tx-history-checker'
import {TitleNav, AccountDisplay, CurrentNetworkDisplay} from '../../components'
import {useCurrentTxParams, useEstimateTx, useEstimateError} from '../../hooks'
import {ToAddressInput, TokenAndAmount} from './components'
import {validateAddress, validateByEip55} from '../../utils'
import {
  useNetworkTypeIsCfx,
  useCurrentAddress,
  useSingleTokenInfoWithNativeTokenSupport,
} from '../../hooks/useApi'
import {ROUTES} from '../../constants'
const {CONFIRM_TRANSACTION} = ROUTES

function SendTransaction() {
  const {t} = useTranslation()
  const history = useHistory()
  const {
    toAddress,
    sendAmount,
    sendTokenId,
    gasLevel,
    maxMode,
    setToAddress,
    setSendAmount,
    setSendTokenId,
    setGasPrice,
    setMaxPriorityFeePerGas,
    setMaxFeePerGas,
    setGasLimit,
    setNonce,
    setStorageLimit,
    setMaxMode,
    setGasLevel,
    tx,
    clearSendTransactionParams,
    clearAdvancedGasSetting,
  } = useCurrentTxParams()
  const {
    data: {
      value: address,
      network: {eid: networkId, type, netId, ticker: nativeToken},
      account: {nickname},
    },
  } = useCurrentAddress()
  const {address: tokenAddress, decimals} =
    useSingleTokenInfoWithNativeTokenSupport(sendTokenId)
  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const [addressError, setAddressError] = useState('')
  const [estimateError, setEstimateError] = useState('')
  const [hasNoTxn, setHasNoTxn] = useState(false)
  const {errorAnimateStyle, displayErrorMsg} = useInputErrorAnimation(
    sendAmount ? estimateError : '',
  )
  const isNativeToken = !tokenAddress
  const estimateRst =
    useEstimateTx(
      tx,
      !isNativeToken
        ? {[tokenAddress]: convertValueToData(sendAmount, decimals)}
        : {},
    ) || {}
  const {
    gasPrice: estimateGasPrice,
    maxFeePerGas: estimateMaxFeePerGas,
    maxPriorityFeePerGas: estimateMaxPriorityPerGas,
    gasLimit: estimateGasLimit,
    storageCollateralized: estimateStorageLimit,
    nonce,
    nativeMaxDrip,
    loading,
  } = estimateRst

  const isAdvanced = gasLevel === 'advanced'

  useEffect(() => {
    !isAdvanced &&
      estimateGasPrice &&
      setGasPrice(formatHexToDecimal(estimateGasPrice))
    !isAdvanced &&
      estimateMaxPriorityPerGas &&
      setMaxPriorityFeePerGas(formatHexToDecimal(estimateMaxPriorityPerGas))
    !isAdvanced &&
      estimateMaxFeePerGas &&
      setMaxFeePerGas(formatHexToDecimal(estimateMaxFeePerGas))
    !isAdvanced &&
      estimateGasLimit &&
      setGasLimit(formatHexToDecimal(estimateGasLimit))
    !isAdvanced && nonce && setNonce(formatHexToDecimal(nonce))
    !isAdvanced &&
      estimateStorageLimit &&
      setStorageLimit(formatHexToDecimal(estimateStorageLimit))
  }, [
    isAdvanced,
    estimateGasPrice,
    estimateMaxPriorityPerGas,
    estimateMaxFeePerGas,
    estimateGasLimit,
    nonce,
    estimateStorageLimit,
    setGasPrice,
    setMaxPriorityFeePerGas,
    setMaxFeePerGas,
    setGasLimit,
    setNonce,
    setStorageLimit,
  ])
  const errorMessage = useEstimateError(
    estimateRst,
    tokenAddress,
    !tokenAddress,
  )
  useEffect(() => {
    !loading && setEstimateError(errorMessage)
  }, [errorMessage, loading])

  useEffect(() => {
    txHistoryChecker({
      address: toAddress,
      type,
      chainId: netId,
    })
      .then(data => {
        setHasNoTxn(!data)
      })
      .catch(() => {
        // console.log('tx history checker error: ', e)
        setHasNoTxn(false)
      })
  }, [netId, toAddress, type])

  const onChangeToken = token => {
    setSendTokenId(token)
    if (maxMode) {
      setSendAmount('')
      setMaxMode(false)
    }
    if (isAdvanced) {
      setGasLevel('medium')
      clearAdvancedGasSetting()
    }
  }
  const onChangeAmount = amount => {
    setSendAmount(amount)
  }
  const onChangeAddress = address => {
    setToAddress(address)
    if (!validateAddress(address, networkTypeIsCfx, netId)) {
      return setAddressError(
        networkTypeIsCfx ? t('invalidAddress') : t('invalidHexAddress'),
      )
    }
    if (!networkTypeIsCfx && !validateByEip55(address)) {
      return setAddressError(t('unChecksumAddress'))
    }
    setAddressError('')
  }
  useEffect(() => {
    if (nativeToken.symbol && !tokenAddress) setSendTokenId('native')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkId])

  const sendDisabled =
    !!addressError || !!estimateError || !toAddress || !sendAmount

  return (
    <div className="flex flex-col h-full w-full bg-blue-circles bg-no-repeat bg-bg">
      <TitleNav
        title={t('sendTransaction')}
        onGoBack={() => setTimeout(() => clearSendTransactionParams(), 500)}
      />
      <div className="flex mt-1 mb-3 mx-4 justify-between items-center z-20">
        <AccountDisplay nickname={nickname} address={address} />
        <CurrentNetworkDisplay containerClassName="rounded h-6 pl-2" />
      </div>
      <div className="flex flex-1 flex-col justify-between rounded-t-xl bg-gray-0 px-3 pt-4 pb-6">
        <div className="flex flex-col">
          <ToAddressInput
            address={toAddress}
            onChangeAddress={onChangeAddress}
            errorMessage={addressError}
          />
          <TokenAndAmount
            selectedTokenId={sendTokenId}
            amount={sendAmount}
            onChangeAmount={onChangeAmount}
            onChangeToken={onChangeToken}
            isNativeToken={isNativeToken}
            nativeMax={convertDataToValue(nativeMaxDrip, decimals)}
            loading={loading}
          />
          <div className="overflow-hidden">
            <div
              className={`transition duration-300 slide-in-down ease-in-out pt-2 ${errorAnimateStyle}`}
            >
              {displayErrorMsg}
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <Alert
            open={hasNoTxn}
            closable={false}
            width="w-full"
            type="warning"
            content={t('noTxnWarning')}
          />
          <div className="w-full flex mt-6">
            <Button
              variant="outlined"
              className="flex-1 mr-3"
              onClick={() => {
                setTimeout(() => clearSendTransactionParams(), 500)
                history.goBack()
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              disabled={sendDisabled}
              onClick={() => {
                if (loading) return
                history.push(CONFIRM_TRANSACTION)
              }}
              className="flex-1"
            >
              {t('next')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SendTransaction
