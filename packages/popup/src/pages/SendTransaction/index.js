import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {isNumber} from '@fluent-wallet/checks'
import {
  convertDataToValue,
  formatHexToDecimal,
  convertValueToData,
} from '@fluent-wallet/data-format'
import Button from '@fluent-wallet/component-button'
import {ContactsOutlined, RightOutlined} from '@fluent-wallet/component-icons'
import useInputErrorAnimation from '@fluent-wallet/component-input/useAnimation'
import Alert from '@fluent-wallet/component-alert'
import txHistoryChecker from '@fluent-wallet/tx-history-checker'
import {
  CFX_MAINNET_NETID,
  CFX_TESTNET_NETID,
  ETH_GOERLI_NETID,
  ETH_SEPOLIA_NETID,
  ETH_MAINNET_NETID,
} from '@fluent-wallet/consts'

import {
  TitleNav,
  AccountDisplay,
  CurrentNetworkDisplay,
  CompWithLabel,
} from '../../components'
import {
  useCurrentTxParams,
  useEstimateTx,
  useEstimateError,
  useInputAddressInfo,
} from '../../hooks'
import {
  ToAddressInput,
  TokenAndAmount,
  AddressWithAlternativeName,
} from './components'
import {
  useCurrentAddress,
  useBalance,
  useSingleTokenInfoWithNativeTokenSupport,
  useAddressNote,
} from '../../hooks/useApi'
import {useTokenPayAvailability} from '../../hooks/useTokenPay'
import {
  GAS_PAYMENT_METHOD,
  ROUTES,
  NETWORK_TYPE,
  MAX_STRATEGY,
} from '../../constants'
import {bn16} from '../../utils'
import useGlobalStore from '../../stores'

const {CONFIRM_TRANSACTION, ADDRESS_BOOK} = ROUTES

const useToAddressPlaceHolder = ({type, netId}) => {
  const [placeholder, setPlaceholder] = useState('')
  const {t} = useTranslation()

  useEffect(() => {
    if (!isNumber(netId)) {
      return
    }

    if (type === NETWORK_TYPE.CFX) {
      if (netId === CFX_MAINNET_NETID || netId === CFX_TESTNET_NETID) {
        return setPlaceholder(t('cnsAddressPlaceholder'))
      }

      setPlaceholder(t('cfxAddressPlaceholder'))
    }

    if (type === NETWORK_TYPE.ETH) {
      if (
        netId === ETH_MAINNET_NETID ||
        netId === ETH_GOERLI_NETID ||
        netId === ETH_SEPOLIA_NETID
      ) {
        return setPlaceholder(t('ensAddressPlaceholder'))
      }
      setPlaceholder(t('ethAddressPlaceholder'))
    }
  }, [type, netId, t])
  return placeholder
}

function SendTransaction() {
  const {t} = useTranslation()
  const history = useHistory()
  const {
    toAddress,
    sendAmount,
    sendTokenId,
    maxStrategy,
    setToAddress,
    setSendAmount,
    setSendTokenId,
    setGasPrice,
    setMaxPriorityFeePerGas,
    setMaxFeePerGas,
    setGasLimit,
    setNonce,
    setStorageLimit,
    setMaxStrategy,
    setGasPayment,
    setSyncTxWithForm,
    tx,
    clearSendTransactionParams,
  } = useCurrentTxParams()

  const {
    data: {
      value: address,
      nativeBalance,
      network: {eid: networkId, type, netId, ticker: nativeToken},
      account: {nickname, accountGroup},
    },
  } = useCurrentAddress()
  const isHwAccount = accountGroup?.vault?.type === 'hw'
  const {canUseTokenPay, tokenPayConfigLoading} = useTokenPayAvailability({
    isHwAccount,
    networkDbId: networkId,
  })

  const toAddressInputPlaceholder = useToAddressPlaceHolder({type, netId})

  useEffect(() => {
    // reset syncTxWithForm to true.
    setSyncTxWithForm(true)
  }, [setSyncTxWithForm])

  const {address: tokenAddress, decimals} =
    useSingleTokenInfoWithNativeTokenSupport(sendTokenId)

  const sendTokenBalanceKey = tokenAddress || '0x0'
  const sendTokenBalanceData = useBalance(
    address,
    networkId,
    sendTokenBalanceKey,
  )

  const sendTokenBalance =
    sendTokenBalanceData?.[address?.toLowerCase()]?.[
      sendTokenBalanceKey.toLowerCase()
    ] ||
    sendTokenBalanceData?.[address]?.[sendTokenBalanceKey] ||
    '0x0'

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
  const nativeSendValue =
    isNativeToken && sendAmount
      ? convertValueToData(sendAmount, decimals) || '0x0'
      : '0x0'
  const hasNativeSendValue =
    !isNativeToken ||
    bn16(nativeBalance || '0x0').gte(bn16(nativeSendValue || '0x0'))
  const canIgnoreGasBalanceError = canUseTokenPay && hasNativeSendValue

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
    true,
    {ignoreGasBalanceError: canIgnoreGasBalanceError},
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

  const isLegacyNativeMaxUnavailable =
    !canUseTokenPay && isNativeToken && (loading || !nativeMaxDrip)
  const maxDisabled =
    (!isHwAccount && tokenPayConfigLoading) || isLegacyNativeMaxUnavailable

  const onChangeToken = token => {
    setSendTokenId(token)
    if (maxStrategy) setSendAmount('')
    setMaxStrategy(null)
  }
  const onChangeAmount = amount => {
    setSendAmount(amount)
    setMaxStrategy(null)
  }

  const onClickMax = () => {
    if (maxDisabled) return

    if (canUseTokenPay) {
      setMaxStrategy(MAX_STRATEGY.DEFERRED)
      setSendAmount(convertDataToValue(sendTokenBalance, decimals))
      return
    }

    setGasPayment({method: GAS_PAYMENT_METHOD.NATIVE})
    setMaxStrategy(MAX_STRATEGY.LEGACY)
    setSendAmount(
      convertDataToValue(
        isNativeToken ? nativeMaxDrip : sendTokenBalance,
        decimals,
      ),
    )
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
  } = useInputAddressInfo({
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
          <CompWithLabel
            label={
              <div className="flex items-center justify-between">
                <div className="text-gray-40">{t('toAddressLabel')}</div>
                <div
                  id="go-address-book"
                  className="flex items-center text-primary cursor-pointer"
                  aria-hidden="true"
                  onClick={() => history.push(ADDRESS_BOOK)}
                >
                  <ContactsOutlined className="w-[14px] h-[14px]" />
                  <span className="text-primary mx-1">{t('recent')}</span>
                  <RightOutlined className="w-3 h-3" />
                </div>
              </div>
            }
            className="!mt-0"
            labelClassName="!text-gray-40"
          >
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
                placeholder={toAddressInputPlaceholder}
              />
            )}
          </CompWithLabel>

          <TokenAndAmount
            selectedTokenId={sendTokenId}
            amount={sendAmount}
            balance={sendTokenBalance}
            isMaxSelected={Boolean(maxStrategy)}
            maxDisabled={maxDisabled}
            onChangeAmount={onChangeAmount}
            onChangeToken={onChangeToken}
            onClickMax={onClickMax}
          />
          <div className="overflow-hidden">
            <div
              className={`transition duration-300 slide-in-down ease-in-out pt-2 ${errorAnimateStyle}`}
            >
              {displayErrorMsg}
            </div>
            {maxStrategy === MAX_STRATEGY.DEFERRED && (
              <div className="pt-2 text-xs text-gray-40">
                {t('sendMaxGasTip')}
              </div>
            )}
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
