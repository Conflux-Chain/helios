import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {
  formatHexToDecimal,
  convertDataToValue,
} from '@fluent-wallet/data-format'
import Button from '@fluent-wallet/component-button'
import Alert from '@fluent-wallet/component-alert'
import {TitleNav, AccountDisplay} from '../../components'
import {useTxParams, useEstimateTx, useCheckBalanceAndGas} from '../../hooks'
import {
  ToAddressInput,
  TokenAndAmount,
  CurrentNetworkDisplay,
} from './components'
import useGlobalStore from '../../stores'
import {bn16, validateAddress} from '../../utils'
import {
  useNetworkTypeIsCfx,
  useCurrentNetwork,
  useCurrentAccount,
} from '../../hooks/useApi'
import {ROUTES} from '../../constants'
const {HOME, CONFIRM_TRANSACTION} = ROUTES

function SendTransaction() {
  const {t} = useTranslation()
  const history = useHistory()
  const {
    toAddress,
    sendAmount,
    sendToken,
    setToAddress,
    setSendAmount,
    setSendToken,
    setGasPrice,
    setGasLimit,
    setNonce,
    clearSendTransactionParams,
  } = useGlobalStore()
  const {name, icon, ticker, netId} = useCurrentNetwork()
  const {address, eid: accountId, nickname} = useCurrentAccount()
  const {address: tokenAddress, decimals} = sendToken
  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const [addressError, setAddressError] = useState('')
  const [balanceError, setBalanceError] = useState('')
  const nativeToken = ticker || {}
  const isNativeToken = !tokenAddress
  console.log('ticker', ticker)
  console.log('nativeToken', nativeToken)
  console.log('sendToken', sendToken)
  console.log('toAddress', toAddress)
  const params = useTxParams()
  const estimateRst = useEstimateTx(params) || {}
  console.log('estimateRst = ', estimateRst)
  const {gasPrice, gasLimit, nonce, nativeMaxDrip} = estimateRst
  useEffect(() => {
    setGasPrice(formatHexToDecimal(gasPrice))
    setGasLimit(formatHexToDecimal(gasLimit))
    setNonce(formatHexToDecimal(nonce))
  }, [gasPrice, gasLimit, nonce, setGasPrice, setGasLimit, setNonce])
  console.log('nativeMaxDrip', nativeMaxDrip)
  const errorMessage = useCheckBalanceAndGas(estimateRst)
  useEffect(() => {
    setBalanceError(errorMessage)
  }, [errorMessage])

  // TODO: get from scan
  const hasNoTxn = true
  const onChangeToken = token => {
    console.log(token)
    setSendToken(token)
  }
  const onChangeAmount = amount => {
    console.log(amount)
    setSendAmount(amount)
  }
  const onChangeAddress = address => {
    console.log('address', address)
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
    if (nativeToken.symbol && !tokenAddress) setSendToken(nativeToken)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(nativeToken)])

  return (
    <div className="flex flex-col h-full bg-blue-circles bg-no-repeat bg-bg">
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
        <CurrentNetworkDisplay name={name} icon={icon} />
      </div>
      <div className="flex flex-1 flex-col justify-between rounded-t-xl bg-gray-0 px-3 py-4">
        <div className="flex flex-col">
          <ToAddressInput
            address={toAddress}
            onChangeAddress={onChangeAddress}
            errorMessage={addressError}
          />
          <TokenAndAmount
            selectedToken={sendToken}
            amount={sendAmount}
            onChangeAmount={onChangeAmount}
            onChangeToken={onChangeToken}
            isNativeToken={isNativeToken}
            nativeMax={
              bn16(nativeMaxDrip).lten(0)
                ? '0'
                : convertDataToValue(nativeMaxDrip, decimals)
            }
          />
          <span className="text-error text-xs inline-block mt-2">
            {balanceError}
          </span>
        </div>
        <div className="flex flex-col">
          {hasNoTxn && <Alert type="warning" content={t('noTxnWarning')} />}
          <div className="w-full flex px-1">
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
                !!addressError || !!balanceError || !toAddress || !sendAmount
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
