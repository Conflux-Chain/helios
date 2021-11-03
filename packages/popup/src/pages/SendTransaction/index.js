/* eslint-disable no-unused-vars */
import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {validateBase32Address} from '@fluent-wallet/base32-address'
import {isHexAddress} from '@fluent-wallet/account'
import Button from '@fluent-wallet/component-button'
import Alert from '@fluent-wallet/component-alert'
import {TitleNav, GasFee} from '../../components'
import {
  ToAddressInput,
  TokenAndAmount,
  CurrentAccountDisplay,
  CurrentNetworkDisplay,
} from './components'
import useGlobalStore from '../../stores/index.js'
import {
  useCurrentNativeToken,
  useNetworkTypeIsEth,
  useNetworkTypeIsCfx,
  useCurrentNetwork,
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
  } = useGlobalStore()
  const currentNetwork = useCurrentNetwork()
  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const networkTypeIsEth = useNetworkTypeIsEth()
  const [addressError, setAddressError] = useState('')
  const [balanceError, setBalanceError] = useState('')
  const [gasError, setGasError] = useState('')
  const nativeToken = useCurrentNativeToken()
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
    console.log(address)
    setToAddress(address)
    if (
      networkTypeIsCfx &&
      !validateBase32Address(address, currentNetwork?.netId)
    ) {
      // TODO i18n
      setAddressError('Please enter validate cfx address')
    } else if (networkTypeIsEth && !isHexAddress(address)) {
      // TODO i18n
      setAddressError('Please enter validate hex address')
    } else {
      setAddressError('')
    }
  }
  useEffect(() => {
    if (nativeToken) setSendToken(nativeToken)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(nativeToken)])

  return (
    <div className="flex flex-col h-full bg-blue-circles bg-no-repeat bg-bg">
      <TitleNav title={t('sendTransaction')} />
      <div className="flex mt-1 mb-3 mx-4 justify-between items-center z-20">
        <CurrentAccountDisplay />
        <CurrentNetworkDisplay />
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
          />
          <GasFee />
          <span className="text-error text-xs inline-block mt-2">
            {balanceError || gasError}
          </span>
        </div>
        <div className="flex flex-col">
          {hasNoTxn && <Alert type="warning" content={t('noTxnWarning')} />}
          <div className="w-full flex px-1">
            <Button
              variant="outlined"
              className="flex-1 mr-3"
              onClick={() => history.push(HOME)}
            >
              {t('cancel')}
            </Button>
            <Button
              disabled={
                !!addressError ||
                !!balanceError ||
                !!gasError ||
                !toAddress ||
                !sendAmount
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
