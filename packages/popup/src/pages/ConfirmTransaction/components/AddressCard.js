import {useState} from 'react'
import PropTypes from 'prop-types'
import useGlobalStore from '../../../stores'
import {useQuery} from '../../../hooks'
import {useCurrentNativeToken, useAddressType} from '../../../hooks/useApi'
import {get20Token} from '../../../utils/api'

function AddressCard() {
  const query = useQuery()
  const original = query.get('original')
  const [displayToken, setDisplayToken] = useState({})
  const [displayValue, setDisplayValue] = useState('0x0')
  const [displayToAddress, setDisplayToAddress] = useState('')
  const {toAddress, sendToken, sendAmount} = useGlobalStore()
  const [method, setMethod] = useState('Unknown')
  const nativeToken = useCurrentNativeToken()
  const isPopup = original === 'popup'
  const isDapp = original === 'dapp'
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
  const isSign = !isApproveToken && !isSendToken

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
  console.log(displayToken, displayValue, displayToAddress, isSign)
  return <div></div>
}

AddressCard.propTypes = {
  original: PropTypes.oneOf(['popup', 'dapp']),
  params: PropTypes.object,
}

export default AddressCard
