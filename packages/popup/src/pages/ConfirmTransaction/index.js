import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import Link from '@fluent-wallet/component-link'
import Button from '@fluent-wallet/component-button'
import {RightOutlined} from '@fluent-wallet/component-icons'
import useGlobalStore from '../../stores'
import {useQuery} from '../../hooks'
import {useCurrentNativeToken, useAddressType} from '../../hooks/useApi'
import {get20Token} from '../../utils/api'
import {AddressCard, InfoList} from './components'
import {TitleNav} from '../../components'
import {ROUTES} from '../../constants'
const {VIEW_DATA, HOME} = ROUTES

function ConfirmTransition() {
  const query = useQuery()
  const {t} = useTranslation()
  const origin = query.get('origin')
  const [displayToken, setDisplayToken] = useState({})
  const [displayValue, setDisplayValue] = useState('0x0')
  const [displayToAddress, setDisplayToAddress] = useState('')
  const {toAddress, sendToken, sendAmount} = useGlobalStore()
  const [method, setMethod] = useState('Unknown')
  const nativeToken = useCurrentNativeToken()
  const isPopup = origin === 'popup'
  const isDapp = origin === 'dapp'
  // TODO get from pending rpc
  const params = {}
  const {value, to, data} = params || {}

  const type = useAddressType(to)
  const isContract = type === 'contract'
  let token
  if (isContract) {
    token = get20Token(to)
  }
  const isSendToken =
    isPopup || (isDapp && method === 'transfer' && token?.symbol)
  const isApproveToken = isDapp && method === 'approve' && token?.symbol
  const isSign = !isSendToken && !isApproveToken

  if (isPopup) {
    setDisplayToken(sendToken)
    setDisplayToAddress(toAddress)
    setDisplayValue(sendAmount)
  }

  if (isDapp) {
    if (!isContract || (isContract && !data)) {
      setDisplayToken(nativeToken)
      setDisplayToAddress(to)
      setDisplayValue(value)
    }

    if (data && isContract) {
      // TODO get from contract decode package
      const decodeData = {}
      const {name, object: methodArgs} = decodeData
      if (name) setMethod(name)
      if (token?.symbol) setDisplayToken(token)
      if (isSendToken) {
        const {to: transferToAddress, value: transferValue} = methodArgs
        setDisplayToAddress(transferToAddress)
        setDisplayValue(transferValue)
      } else if (isApproveToken) {
        const {to: approveToAddress, value: allowance} = methodArgs
        setDisplayToAddress(approveToAddress)
        setDisplayValue(allowance)
      }
    }
  }
  return (
    <div className="flex flex-col h-full">
      <TitleNav title={t('signTransaction')} hasGoBack={isPopup} />
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-col">
          <AddressCard
            token={displayToken}
            toAddress={displayToAddress}
            value={displayValue}
            isSendToken={isSendToken}
            isApproveToken={isApproveToken}
          />
          <InfoList
            token={displayToken}
            isApproveToken={isApproveToken}
            isDapp={isDapp}
            isSign={isSign}
            method={method}
            allowance={displayValue}
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

export default ConfirmTransition
