import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {
  formatHexToDecimal,
  convertDataToValue,
  convertValueToData,
} from '@fluent-wallet/data-format'
import Button from '@fluent-wallet/component-button'
import Alert from '@fluent-wallet/component-alert'
import txHistoryChecker from '@fluent-wallet/tx-history-checker'
import {TitleNav, AccountDisplay, HwAlert} from '../../components'
import {useTxParams, useEstimateTx, useCheckBalanceAndGas} from '../../hooks'
import {
  ToAddressInput,
  TokenAndAmount,
  CurrentNetworkDisplay,
} from './components'
import useGlobalStore from '../../stores'
import {validateAddress} from '../../utils'
import {
  useNetworkTypeIsCfx,
  useCurrentAddress,
  useSingleTokenInfoWithNativeTokenSupport,
} from '../../hooks/useApi'
import {useConnect} from '../../hooks/useLedger'
import {ROUTES} from '../../constants'
const {HOME, CONFIRM_TRANSACTION} = ROUTES

function SendTransaction() {
  const {t} = useTranslation()
  const history = useHistory()
  const {isAppOpen} = useConnect()
  const {
    toAddress,
    sendAmount,
    sendTokenId,
    setToAddress,
    setSendAmount,
    setSendTokenId,
    setGasPrice,
    setGasLimit,
    setNonce,
    setStorageLimit,
    clearSendTransactionParams,
  } = useGlobalStore()
  const {
    data: {
      value: address,
      network: {
        eid: networkId,
        type,
        netId,
        ticker: nativeToken,
        name: networkName,
        icon: networkIcon,
      },
      account: {
        eid: accountId,
        nickname,
        accountGroup: {
          vault: {type: accountType},
        },
      },
    },
  } = useCurrentAddress()
  const isHwError = !isAppOpen && accountType === 'hw'
  const {address: tokenAddress, decimals} =
    useSingleTokenInfoWithNativeTokenSupport(sendTokenId)
  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const [addressError, setAddressError] = useState('')
  const [balanceError, setBalanceError] = useState('')
  const [hasNoTxn, setHasNoTxn] = useState(false)
  const isNativeToken = !tokenAddress
  const params = useTxParams()
  const estimateRst =
    useEstimateTx(
      params,
      !isNativeToken
        ? {[tokenAddress]: convertValueToData(sendAmount, decimals)}
        : {},
    ) || {}
  const {
    gasPrice,
    gasLimit,
    storageCollateralized,
    nonce,
    nativeMaxDrip,
    loading,
  } = estimateRst
  useEffect(() => {
    setGasPrice(formatHexToDecimal(gasPrice))
    setGasLimit(formatHexToDecimal(gasLimit))
    setNonce(formatHexToDecimal(nonce))
    setStorageLimit(formatHexToDecimal(storageCollateralized))
  }, [
    gasPrice,
    gasLimit,
    nonce,
    storageCollateralized,
    setGasPrice,
    setGasLimit,
    setNonce,
    setStorageLimit,
  ])
  const errorMessage = useCheckBalanceAndGas(estimateRst, tokenAddress)
  useEffect(() => {
    sendAmount && setBalanceError(errorMessage)
  }, [errorMessage, sendAmount])

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
  }
  const onChangeAmount = amount => {
    setSendAmount(amount)
  }
  const onChangeAddress = address => {
    setToAddress(address)
    if (!validateAddress(address, networkTypeIsCfx, netId)) {
      if (networkTypeIsCfx) {
        // TODO i18n
        setAddressError('Please enter validate cfx address')
      } else {
        setAddressError('Please enter validate hex address')
      }
    } else {
      setAddressError('')
    }
  }
  useEffect(() => {
    if (nativeToken.symbol && !tokenAddress) setSendTokenId('native')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkId])

  return (
    <div className="flex flex-col h-150 w-93 m-auto light bg-blue-circles bg-no-repeat bg-bg">
      <TitleNav
        title={t('sendTransaction')}
        onGoBack={() => clearSendTransactionParams()}
      />
      <div className="flex mt-1 mb-3 mx-4 justify-between items-center z-20">
        <AccountDisplay
          accountId={accountId}
          nickname={nickname}
          address={address}
        />
        <CurrentNetworkDisplay name={networkName} icon={networkIcon} />
      </div>
      <div className="flex flex-1 flex-col justify-between rounded-t-xl bg-gray-0 px-3 py-4">
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
          />
          {balanceError && (
            <span className="text-error text-xs inline-block mt-2">
              {balanceError}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <HwAlert open={isHwError} />
          <Alert
            open={hasNoTxn && !isHwError}
            closable={false}
            width="w-full"
            type="warning"
            content={t('noTxnWarning')}
          />
          <div className="w-full flex px-1 mt-6">
            <Button
              variant="outlined"
              className="flex-1 mr-3"
              onClick={() => {
                clearSendTransactionParams()
                history.push(HOME)
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              disabled={
                !!addressError ||
                !!balanceError ||
                !toAddress ||
                !sendAmount ||
                loading ||
                isHwError
              }
              onClick={() => history.push(CONFIRM_TRANSACTION)}
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
