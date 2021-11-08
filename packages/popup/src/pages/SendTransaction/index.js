/* eslint-disable no-unused-vars */
import {useState, useEffect, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import BN from 'bn.js'
import {validateBase32Address} from '@fluent-wallet/base32-address'
import {addHexPrefix} from '@fluent-wallet/utils'
import {CFX_DECIMALS, ETH_DECIMALS} from '@fluent-wallet/data-format'
import {isHexAddress} from '@fluent-wallet/account'
import Button from '@fluent-wallet/component-button'
import Alert from '@fluent-wallet/component-alert'
import {TitleNav, GasFee} from '../../components'
import {useEstimateTx} from '../../hooks'
import {
  ToAddressInput,
  TokenAndAmount,
  CurrentAccountDisplay,
  CurrentNetworkDisplay,
} from './components'
import useGlobalStore from '../../stores/index.js'
import {
  useCurrentNativeToken,
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
    gasPrice,
    setToAddress,
    setSendAmount,
    setSendToken,
    clearSendTransactionParams,
  } = useGlobalStore()
  const currentNetwork = useCurrentNetwork()
  const currentAccount = useCurrentAccount()
  const {address} = currentAccount
  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const [addressError, setAddressError] = useState('')
  const [balanceError, setBalanceError] = useState('')
  const [gasError, setGasError] = useState('')
  const nativeToken = currentNetwork?.ticker
  console.log(nativeToken)

  let to,
    decimals = CFX_DECIMALS
  if (sendToken?.symbol === nativeToken?.symbol) {
    to = toAddress
    decimals = networkTypeIsCfx ? CFX_DECIMALS : ETH_DECIMALS
  } else if (sendToken?.address) {
    to.current = sendToken?.address
    decimals = sendToken?.decimals
  }

  console.log(to)
  const params = {
    from: address,
    to,
    gasPrice: addHexPrefix(new BN(gasPrice, 10).toString(16)),
    value: addHexPrefix(
      new BN(sendAmount || '0', 10)
        .mul(new BN('10', 10).pow(new BN(decimals, 10)))
        .toString(16),
    ),
  }
  console.log(params)
  const estimateRst = useEstimateTx(params)
  console.log('estimateRst = ', estimateRst)
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
    } else if (!networkTypeIsCfx && !isHexAddress(address)) {
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
      <TitleNav
        title={t('sendTransaction')}
        onGoBack={() => clearSendTransactionParams()}
      />
      <div className="flex mt-1 mb-3 mx-4 justify-between items-center z-20">
        <CurrentAccountDisplay currentAccount={currentAccount} />
        <CurrentNetworkDisplay currentNetwork={currentNetwork} />
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
