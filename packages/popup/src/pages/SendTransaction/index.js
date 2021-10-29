import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import Alert from '@fluent-wallet/component-alert'
import {TitleNav, CurrentNetworkDisplay, GasFee} from '../../components'
import {
  ToAddressInput,
  TokenAndAmount,
  CurrentAccountDisplay,
} from './components'
import useGlobalStore from '../../stores/index.js'
import {useCurrentNativeToken} from '../../hooks/useApi'
import {ROUTES} from '../../constants'
const {HOME} = ROUTES

function SendTransaction() {
  const {t} = useTranslation()
  const {
    toAddress,
    sendAmount,
    sendToken,
    setToAddress,
    setSendAmount,
    setSendToken,
  } = useGlobalStore
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
  if (nativeToken) setSendToken(nativeToken)
  return (
    <div className="flex flex-col h-full relative bg-bg">
      <img
        src="/images/send-transaction-bg.svg"
        alt="top"
        className="absolute top-0"
      />
      <TitleNav title={t('sendTransaction')} />
      <div className="flex mt-1 mb-3 mx-4 justify-between items-center z-20">
        <CurrentAccountDisplay />
        <CurrentNetworkDisplay />
      </div>
      <div className="flex flex-1 flex-col justify-between rounded-t-xl bg-gray-0 px-3 py-4">
        <div className="flex flex-col">
          <ToAddressInput address={toAddress} onChangeAddress={setToAddress} />
          <TokenAndAmount
            selectedToken={sendToken}
            amount={sendAmount}
            onChangeAmount={onChangeAmount}
            onChangeToken={onChangeToken}
          />
          <GasFee />
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
            <Button className="flex-1">{t('next')}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SendTransaction
