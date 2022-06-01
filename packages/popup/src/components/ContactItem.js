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
function ContactItem({
  address = '',
  memo = '',
  memoId,
  onSubmitCallback,
  onClickAwayCallback,
  editMemo = false,
  rightComponent,
}) {
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
      network: {netId, eid: networkId},
    },
  } = useCurrentAddress()

  const queryAddressMemo = async () => {
    return request(WALLET_QUERY_MEMO, {
      address: inputAddress,
      networkId,
    })
  }

  const updateInsertMemo = async () => {
    return request(WALLET_UPDATE_INSERT_MEMO, {
      address: inputAddress,
      value: inputMemo,
      memoId,
    })
  }

  const onValidate = () => {
    const isValidatedAddress = validateInputAddress()
    if (
      !inputMemo.trim() ||
      !isValidatedAddress ||
      (inputMemo.trim() === memo.trim() && inputAddress === address)
    ) {
      return false
    }
    return true
  }

  const onsubmit = async () => {
    if (!isNumber(memoId)) {
      // can not add twice
      const addedMemo = await queryAddressMemo()

      if (addedMemo?.data?.length) {
        setAddressErrorMsg(t('addedContactWarning'))
        return
      }
    }

    const ret = await updateInsertMemo()
    ret && onSubmitCallback?.()
  }

  const onClickSubmitButton = async () => {
    try {
      const isValidate = onValidate()
      if (!isValidate) {
        return
      }
      setLoading(true)
      await onsubmit()
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

  const onClickAway = async () => {
    if (showAddressInput === 'show' || showMemoInput === 'show') {
      try {
        const isValidate = onValidate()
        if (isValidate) {
          setLoading(true)
          await onsubmit()
          setLoading(false)
        }
        onClickAwayCallback?.()
      } catch (e) {
        setLoading(false)
        onClickAwayCallback?.()
        Message.error({
          content: e?.message ?? t('unCaughtErrMsg'),
          top: '10px',
          duration: 1,
        })
      }
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
    let timer = null
    if (memo === '' || (isNumber(memoId) && editMemo)) {
      setShowMemoInput('show')
      timer = setTimeout(() => {
        memoTextInputRef?.current?.focus?.()
      })
    } else {
      setShowMemoInput('hidden')
    }
    return () => {
      clearTimeout(timer)
    }
  }, [memo, editMemo, memoId])

  useClickAway(containerRef, () => {
    onClickAway()
  })

  return (
    <div>
      <div
        className="flex items-center bg-primary-10"
        id={address}
        ref={containerRef}
      >
        <div className="flex">
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
              isAddress={true}
            />
          </div>
        </div>
        <div>
          {showAddressInput === 'show' || showMemoInput === 'show' ? (
            <CheckCircleFilled
              className="w-5 h-5 text-white cursor-pointer"
              strokeColor="#ccc"
              onClick={onClickSubmitButton}
              id="update-memo"
            />
          ) : rightComponent ? (
            rightComponent
          ) : null}
        </div>
      </div>
      <div> {addressErrorMsg}</div>
    </div>
  )
}
ContactItem.propTypes = {
  address: PropTypes.string,
  memo: PropTypes.string,
  memoId: PropTypes.number,
  onSubmitCallback: PropTypes.func,
  onClickAwayCallback: PropTypes.func,
  editMemo: PropTypes.bool,
  rightComponent: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.string,
  ]),
}
export default ContactItem
