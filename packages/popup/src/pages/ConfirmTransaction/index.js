import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Link from '@fluent-wallet/component-link'
import Button from '@fluent-wallet/component-button'
import {RightOutlined} from '@fluent-wallet/component-icons'
import useGlobalStore from '../../stores'
import {
  useCurrentNativeToken,
  useAddressType,
  usePendingAuthReq,
} from '../../hooks/useApi'
import {get20Token} from '../../utils/api'
import {AddressCard, InfoList} from './components'
import {TitleNav} from '../../components'
import {ROUTES} from '../../constants'
const {VIEW_DATA, HOME} = ROUTES

function ConfirmTransition() {
  const {t} = useTranslation()
  const history = useHistory()
  const pendingAuthReq = usePendingAuthReq()
  let displayToken = {},
    displayValue = '0x0',
    displayToAddress = '',
    method = 'Unknown'
  const {toAddress, sendToken, sendAmount, clearSendTransactionParams} =
    useGlobalStore()
  const nativeToken = useCurrentNativeToken()
  const [{req}] = pendingAuthReq?.length ? pendingAuthReq : [{}]
  const isDapp = pendingAuthReq?.length > 0
  // TODO get from pending rpc
  const {value, to, data} = req?.params?.[1] || {}

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
    if (data && isContract) {
      // TODO get from contract decode package
      const decodeData = {}
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

  return (
    <div className="flex flex-col h-full">
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
            <Button className="flex-1">{t('next')}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmTransition
