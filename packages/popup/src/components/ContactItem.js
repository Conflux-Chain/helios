import PropTypes from 'prop-types'
import {useState, useEffect, useRef} from 'react'
import {useTranslation} from 'react-i18next'

import {isHexAddress} from '@fluent-wallet/account'
import {decode} from '@fluent-wallet/base32-address'
import {CheckCircleFilled} from '@fluent-wallet/component-icons'
import {Avatar, TextField} from '.'
import {useClickAway} from 'react-use'

import {validateAddress, validateByEip55} from '../utils'
import {useNetworkTypeIsCfx, useCurrentAddress} from '../hooks/useApi'

function ContactItem({address = '', memo = ''}) {
  const {t} = useTranslation()
  const containerRef = useRef(null)
  const memoTextInputRef = useRef(null)

  const [showAddressInput, setShowAddressInput] = useState('hidden')
  const [showMemoInput, setShowMemoInput] = useState('hidden')
  const [inputAddress, setInputAddress] = useState(address)
  const [inputMemo, setInputMemo] = useState(memo)
  const [addressErrorMsg, setAddressErrorMsg] = useState('')

  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const {
    data: {
      network: {netId},
    },
  } = useCurrentAddress()

  const onsubmit = () => {
    const isValidatedAddress = validateInputAddress()
    if (!inputMemo.trim() || !isValidatedAddress) {
      return
    }
    // TODO:loading and 提交成功之后 显示文本
    console.log('onsubmit')
  }

  const validateInputAddress = () => {
    if (!validateAddress(inputAddress, networkTypeIsCfx, netId)) {
      setAddressErrorMsg(
        networkTypeIsCfx ? t('invalidAddress') : t('invalidHexAddress'),
      )
      return false
    }
    if (!networkTypeIsCfx && !validateByEip55(inputAddress)) {
      setAddressErrorMsg(t('unChecksumAddress'))
      return false
    }
    setAddressErrorMsg('')
    return true
  }

  useEffect(() => {
    setShowAddressInput(address === '' ? 'show' : 'hidden')
  }, [address])

  useEffect(() => {
    if (memo === '') {
      setShowMemoInput('show')
      setTimeout(() => {
        memoTextInputRef?.current?.focus?.()
      })
    } else {
      setShowMemoInput('hidden')
    }
  }, [memo])

  useClickAway(containerRef, () => {
    onsubmit()
  })

  return (
    <div>
      <div
        className="flex items-center bg-primary-10"
        id={address}
        ref={containerRef}
      >
        <Avatar
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-0 mr-2"
          diameter={30}
          accountIdentity={
            address && !isHexAddress(address) ? decode(address) : address
          }
        />
        <div>
          <TextField
            maxLength={null}
            textValue={memo}
            inputValue={inputMemo}
            controlInputStatus={showMemoInput}
            onInputChange={memo => setInputMemo(memo)}
            ref={memoTextInputRef}
          />
          <TextField
            maxLength={null}
            textValue={address}
            inputValue={inputAddress}
            controlInputStatus={showAddressInput}
            onInputChange={address => setInputAddress(address)}
          />
        </div>
        <CheckCircleFilled
          className="w-5 h-5 text-white cursor-pointer"
          strokeColor="#ccc"
          onClick={onsubmit}
          id="update-memo"
        />
      </div>
      <div> {addressErrorMsg}</div>
    </div>
  )
}
ContactItem.propTypes = {
  address: PropTypes.string,
  memo: PropTypes.string,
  memoId: PropTypes.number,
}
export default ContactItem
