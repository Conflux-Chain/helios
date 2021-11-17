import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Link from '@fluent-wallet/component-link'
import Button from '@fluent-wallet/component-button'
import {RightOutlined} from '@fluent-wallet/component-icons'
import {getCFXContractMethodSignature} from '@fluent-wallet/contract-method-name'
import {formatDecimalToHex, convertDecimal} from '@fluent-wallet/data-format'
import useGlobalStore from '../../stores'
import {useTxParams, useEstimateTx, useCheckBalanceAndGas} from '../../hooks'
import {
  useCurrentNativeToken,
  useCurrentNetwork,
  useAddressType,
  usePendingAuthReq,
  useNetworkTypeIsCfx,
  useValid20Token,
} from '../../hooks/useApi'
import {request} from '../../utils'
import {AddressCard, InfoList, TransactionResult} from './components'
import {TitleNav, GasFee, DappFooter} from '../../components'
import {ROUTES, RPC_METHODS} from '../../constants'
const {VIEW_DATA, HOME} = ROUTES
const {CFX_SEND_TRANSACTION, ETH_SEND_TRANSACTION} = RPC_METHODS

function ConfirmTransition() {
  const {t} = useTranslation()
  const history = useHistory()
  const [showResult, setShowResult] = useState(false)
  const [sendingTransaction, setSendingTransaction] = useState(false)
  const [decodeData, setDecodeData] = useState({})
  const [balanceError, setBalanceError] = useState('')
  const [hash, setHash] = useState('')
  const pendingAuthReq = usePendingAuthReq()
  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const SEND_TRANSACTION = networkTypeIsCfx
    ? CFX_SEND_TRANSACTION
    : ETH_SEND_TRANSACTION
  let displayToken = {},
    displayValue = '0x0',
    displayToAddress = '',
    displayFromAddress = ''
  const {
    toAddress,
    sendToken,
    sendAmount,
    gasPrice,
    gasLimit,
    nonce,
    clearSendTransactionParams,
  } = useGlobalStore()

  const nativeToken = useCurrentNativeToken()
  const {netId} = useCurrentNetwork()

  const [{req}] = pendingAuthReq?.length ? pendingAuthReq : [{}]
  console.log('req', req)
  const isDapp = pendingAuthReq?.length > 0
  const {value, from, to, data, gas, storageLimit} = req?.params[0] || {}
  console.log(value, from, to, data, gas, storageLimit)

  const txPrams = useTxParams()
  const params = !isDapp
    ? {
        ...txPrams,
        gasPrice: formatDecimalToHex(gasPrice),
        gas: formatDecimalToHex(gasLimit),
        nonce: formatDecimalToHex(nonce),
      }
    : req?.params[0]
  console.log('params', params)
  const estimateRst = useEstimateTx(params) || {}
  console.log('estimateRst = ', estimateRst)

  const type = useAddressType(to)
  console.log('type', type)
  const isContract = type === 'contract'
  const token = {...useValid20Token(to), address: to}
  console.log(token)
  const isSendToken =
    !isDapp || (isDapp && decodeData?.name === 'transferFrom' && token?.symbol)
  const isApproveToken =
    isDapp && decodeData?.name === 'approve' && token?.symbol
  const isSign = !isSendToken && !isApproveToken

  useEffect(() => {
    if (isDapp && data && isContract) {
      getCFXContractMethodSignature(to, data, netId).then(
        result => setDecodeData(result) && console.log('decodeData', result),
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDapp, Boolean(data), isContract, to, netId])

  if (!isDapp) {
    displayToken = sendToken
    displayToAddress = toAddress
    displayValue = sendAmount
  } else {
    if (!isContract || (isContract && !data)) {
      displayToken = nativeToken
      displayToAddress = to
      displayValue = value
    }
    if (data && isContract && decodeData) {
      console.log('decodeData', decodeData)
      if (token?.symbol) displayToken = token
      if (isSendToken) {
        displayFromAddress = decodeData?.args?.[0]
        displayToAddress = decodeData?.args?.[1]
        displayValue = convertDecimal(
          decodeData?.args[2].toString(10),
          'divide',
          token?.decimals,
        )
      } else if (isApproveToken) {
        displayToAddress = decodeData?.args?.[0]
        displayValue = convertDecimal(
          decodeData?.args[1].toString(10),
          'divide',
          token?.decimals,
        )
      }
    }
  }
  const errorMessage = useCheckBalanceAndGas(
    estimateRst,
    displayValue,
    displayToken,
    isSendToken,
    displayFromAddress,
  )
  useEffect(() => {
    setBalanceError(errorMessage)
  }, [errorMessage])

  const onSend = () => {
    if (sendingTransaction) return
    setSendingTransaction(true)
    params.storageLimit = '0x80'
    console.log('sendParams', params)
    request(SEND_TRANSACTION, [params]).then(({error, result}) => {
      setSendingTransaction(false)
      if (error) {
        return console.error('error', error.message || error)
      }
      console.log('result=', result)
      setHash(result)
      setShowResult(true)
    })
  }

  return (
    <div className="flex flex-col h-full relative">
      <TitleNav title={t('signTransaction')} hasGoBack={!isDapp} />
      <div className="flex flex-1 flex-col justify-between mt-1 pb-4">
        <div className="flex flex-col px-3">
          <AddressCard
            token={displayToken}
            fromAddress={displayFromAddress}
            toAddress={displayToAddress}
            value={displayValue}
            isSendToken={isSendToken}
            isApproveToken={isApproveToken}
            isDapp={isDapp}
          />
          <InfoList
            token={displayToken}
            isApproveToken={isApproveToken}
            isDapp={isDapp}
            isSign={isSign}
            method={decodeData.name || 'Unknown'}
            allowance={displayValue}
            pendingAuthReq={pendingAuthReq}
          />
          <GasFee estimateRst={estimateRst} isDapp={isDapp} />
          <span className="text-error text-xs inline-block mt-2">
            {balanceError}
          </span>
        </div>
        <div className="flex flex-col items-center">
          {isDapp && (
            <Link onClick={() => history.push(VIEW_DATA)} className="mb-6">
              {t('viewData')}
              <RightOutlined className="w-3 h-3 text-primary ml-1" />
            </Link>
          )}
          {!isDapp && (
            <div className="w-full flex px-4">
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
                className="flex-1"
                onClick={onSend}
                disabled={!!balanceError}
              >
                {t('confirm')}
              </Button>
            </div>
          )}
          {isDapp && (
            <DappFooter
              confirmText={t('confirm')}
              cancelText={t('cancel')}
              confirmDisabled={!!balanceError}
            />
          )}
        </div>
      </div>
      {showResult && <TransactionResult netId={netId} transactionHash={hash} />}
    </div>
  )
}

export default ConfirmTransition
