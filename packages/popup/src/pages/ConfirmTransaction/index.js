import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Link from '@fluent-wallet/component-link'
import Button from '@fluent-wallet/component-button'
import {RightOutlined} from '@fluent-wallet/component-icons'
import {getCFXContractMethodSignature} from '@fluent-wallet/contract-method-name'
import useGlobalStore from '../../stores'
import {
  useCurrentNativeToken,
  useCurrentNetwork,
  useAddressType,
  usePendingAuthReq,
} from '../../hooks/useApi'
import {get20Token} from '../../utils/api'
import {AddressCard, InfoList, TransactionResult} from './components'
import {TitleNav} from '../../components'
import {ROUTES} from '../../constants'
const {VIEW_DATA, HOME} = ROUTES

function ConfirmTransition() {
  const {t} = useTranslation()
  const history = useHistory()
  const [showResult, setShowResult] = useState(false)
  const [decodeData, setDecodeData] = useState(null)
  const pendingAuthReq = usePendingAuthReq()
  let displayToken = {},
    displayValue = '0x0',
    displayToAddress = '',
    method = 'Unknown'
  const {toAddress, sendToken, sendAmount, clearSendTransactionParams} =
    useGlobalStore()
  const nativeToken = useCurrentNativeToken()
  const {netId} = useCurrentNetwork()

  const [{req}] = pendingAuthReq?.length ? pendingAuthReq : [{}]
  const isDapp = pendingAuthReq?.length > 0
  // TODO get from pending rpc
  const {value, to, data} = req?.params || {}

  const type = useAddressType(to)
  const isContract = type === 'contract'
  let token
  if (isContract) {
    token = get20Token(to)
  }
  const isSendToken =
    !isDapp || (isDapp && method === 'transfer' && token?.symbol)
  const isApproveToken = isDapp && method === 'approve' && token?.symbol
  const isSign = !isSendToken && !isApproveToken

  useEffect(() => {
    if (isDapp && data && isContract) {
      getCFXContractMethodSignature(to, data, netId).then(result =>
        setDecodeData(result),
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
      const {name, object: methodArgs} = decodeData
      if (name) method = name
      if (token?.symbol) displayToken = token
      if (isSendToken) {
        const {to: transferToAddress, value: transferValue} = methodArgs
        displayToAddress = transferToAddress
        displayValue = transferValue
      } else if (isApproveToken) {
        const {to: approveToAddress, value: allowance} = methodArgs
        displayToAddress = approveToAddress
        displayValue = allowance
      }
    }
  }
  const onSend = () => {
    // TODO send transaction
    setShowResult(true)
  }

  return (
    <div className="flex flex-col h-full relative">
      <TitleNav title={t('signTransaction')} hasGoBack={!isDapp} />
      <div className="flex flex-1 flex-col justify-between mt-1 px-3 pb-4">
        <div className="flex flex-col">
          <AddressCard
            token={displayToken}
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
            method={method}
            allowance={displayValue}
            pendingAuthReq={pendingAuthReq}
          />
        </div>
        <div className="flex flex-col items-center">
          <Link onClick={() => history.push(VIEW_DATA)}>
            {t('viewData')}
            <RightOutlined className="w-3 h-3 text-primary ml-1" />
          </Link>
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
            <Button className="flex-1" onClick={onSend}>
              {t('confirm')}
            </Button>
          </div>
        </div>
      </div>
      {showResult && <TransactionResult netId={netId} />}
    </div>
  )
}

export default ConfirmTransition
