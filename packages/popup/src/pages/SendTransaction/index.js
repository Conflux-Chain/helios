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
import {
  useCurrentTxParams,
  useEstimateTx,
  useEstimateError,
  useValidatedAddressUsername,
} from '../../hooks'
import {
  ToAddressInput,
  TokenAndAmount,
  AddressWithAlternativeName,
} from './components'
import {
  useCurrentAddress,
  useSingleTokenInfoWithNativeTokenSupport,
  useAddressNote,
} from '../../hooks/useApi'
import {ROUTES} from '../../constants'
import useGlobalStore from '../../stores'

const {CONFIRM_TRANSACTION} = ROUTES

function SendTransaction() {
  const {t} = useTranslation()
  const history = useHistory()
  const {
    toAddress,
    sendAmount,
    sendTokenId,
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
    tx,
    clearSendTransactionParams,
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

  const [addressError, setAddressError] = useState('')
  const [inputAddress, setInputAddress] = useState(toAddress)
  const [isInputAddr, setIsInputAddr] = useState(false)
  const [showAddressChecked, setShowAddressChecked] = useState(false)

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

  useEffect(() => {
    estimateGasPrice && setGasPrice(formatHexToDecimal(estimateGasPrice))
    estimateMaxPriorityPerGas &&
      setMaxPriorityFeePerGas(formatHexToDecimal(estimateMaxPriorityPerGas))
    estimateMaxFeePerGas &&
      setMaxFeePerGas(formatHexToDecimal(estimateMaxFeePerGas))
    estimateGasLimit && setGasLimit(formatHexToDecimal(estimateGasLimit))
    nonce && setNonce(formatHexToDecimal(nonce))
    estimateStorageLimit &&
      setStorageLimit(formatHexToDecimal(estimateStorageLimit))
  }, [
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
      setMaxMode(false)
    }
  }
  const onChangeAmount = amount => {
    setSendAmount(amount)
  }
  const onChangeAddress = address => {
    if (nsLoading) {
      return
    }
    !isInputAddr && setIsInputAddr(true)
    setShowAddressChecked(false)
    setInputAddress(address)
  }

  const onClickAddressInputCloseBtn = () => {
    setInputAddress('')
    !isInputAddr && setIsInputAddr(true)
  }
  //debounce get validate address(cns/ens address) message
  const onRequestNsCb = ({type, ret}) => {
    if (!ret && type === 'nsName') {
      setShowAddressChecked(true)
    }
  }

  const {
    error: validatedAddressError,
    address: validatedAddress,
    nsName,
    loading: nsLoading,
  } = useValidatedAddressUsername({
    inputAddress,
    netId,
    type,
    isInputAddr,
    cb: onRequestNsCb,
  })

  useEffect(() => {
    setAddressError(validatedAddressError)
    setToAddress(validatedAddress)
  }, [validatedAddressError, validatedAddress, setToAddress])

  useEffect(() => {
    if (nativeToken.symbol && !tokenAddress) setSendTokenId('native')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkId])

  const sendDisabled =
    !!addressError || !!estimateError || !toAddress || !sendAmount

  // get address alias name
  const {addressNote, setAddressNote} = useGlobalStore()

  const noteName = useAddressNote(
    toAddress,
    toAddress === Object.keys(addressNote)?.[0],
  )
  const displayNoteName = addressNote?.[toAddress] || noteName

  useEffect(() => {
    return () => {
      setAddressNote?.({})
    }
  }, [setAddressNote])

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
          {(nsName || displayNoteName) && !nsLoading ? (
            <AddressWithAlternativeName
              address={!addressError ? toAddress : ''}
              displayNoteName={displayNoteName}
              nsName={nsName}
              onClickCloseBtn={onClickAddressInputCloseBtn}
            />
          ) : (
            <ToAddressInput
              address={inputAddress}
              onChangeAddress={onChangeAddress}
              errorMessage={addressError}
              addressLoading={nsLoading}
              addressChecked={showAddressChecked}
              onClickCloseBtn={onClickAddressInputCloseBtn}
            />
          )}

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
