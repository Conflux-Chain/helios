import PropTypes from 'prop-types'
import {useState, useEffect, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {isNumber} from '@fluent-wallet/checks'

import Message from '@fluent-wallet/component-message'
import {isHexAddress} from '@fluent-wallet/account'
import {decode} from '@fluent-wallet/base32-address'
import {CheckCircleFilled} from '@fluent-wallet/component-icons'
import {Avatar, TextField} from '.'
import {useClickAway} from 'react-use'

import {validateAddress, validateByEip55, request} from '../utils'
import {useNetworkTypeIsCfx, useCurrentAddress} from '../hooks/useApi'
import useLoading from '../hooks/useLoading'
import {RPC_METHODS} from '../constants'

const {WALLET_UPDATE_INSERT_MEMO, WALLET_QUERY_MEMO} = RPC_METHODS
function ContactItem({address = '', memo = '', memoId, callback}) {
  const {t} = useTranslation()
  const containerRef = useRef(null)
  const memoTextInputRef = useRef(null)

  const [showAddressInput, setShowAddressInput] = useState('hidden')
  const [showMemoInput, setShowMemoInput] = useState('hidden')
  const [inputAddress, setInputAddress] = useState(address)
  const [inputMemo, setInputMemo] = useState(memo)
  const [addressErrorMsg, setAddressErrorMsg] = useState('')

  const {setLoading} = useLoading()
  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const {
    data: {
      network: {netId, type},
    },
  } = useCurrentAddress()

  const queryAddressMemo = async () => {
    return request(WALLET_QUERY_MEMO, {
      address: inputAddress,
      // TODO: chainId 替换？
      type,
    })
  }

  const updateInsertMemo = async () => {
    return request(WALLET_UPDATE_INSERT_MEMO, {
      address: inputAddress,
      value: inputMemo,
      memoId,
    })
  }

  const onsubmit = async () => {
    try {
      const isValidatedAddress = validateInputAddress()
      if (!inputMemo.trim() || !isValidatedAddress) {
        return
      }
      setLoading(true)

      if (!isNumber(memoId)) {
        // can not add twice
        const addedMemoArray = await queryAddressMemo()

        console.log('addedMemoArray', addedMemoArray)

        if (addedMemoArray?.length) {
          setLoading(false)
          setAddressErrorMsg(t('addedContactWarning'))
          return
        }
      }

      const ret = await updateInsertMemo()

      console.log('ret', ret)
      ret && callback?.()
      setLoading(false)
    } catch (e) {
      setLoading(false)
      Message.error({
        content: e?.message ?? t('unCaughtErrMsg'),
        top: '10px',
        duration: 1,
      })
    }
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
  callback: PropTypes.func,
}
export default ContactItem
