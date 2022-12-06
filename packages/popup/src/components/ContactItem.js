import PropTypes from 'prop-types'
import {useState, useEffect, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {isNumber} from '@fluent-wallet/checks'
import Message from '@fluent-wallet/component-message'
import {CheckCircleFilled} from '@fluent-wallet/component-icons'
import {Avatar, TextField} from '.'
import {useClickAway} from 'react-use'

import {validateAddress, validateByEip55, request} from '../utils'
import {useNetworkTypeIsCfx, useCurrentAddress} from '../hooks/useApi'
import useLoading from '../hooks/useLoading'
import {RPC_METHODS} from '../constants'

const {WALLET_UPDATE_INSERT_MEMO, WALLET_QUERY_MEMO} = RPC_METHODS
function ContactItem({
  containerClassName = 'mt-3',
  address = '',
  memo = '',
  memoOverlay,
  memoId,
  onSubmitCallback,
  onClickAwayCallback,
  editMemo = false,
  rightComponent,
  itemId,
}) {
  const {t} = useTranslation()
  const containerRef = useRef(null)
  const memoTextInputRef = useRef(null)

  const [showAddressInput, setShowAddressInput] = useState(false)
  const [showMemoInput, setShowMemoInput] = useState(false)
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
    let ret = {isValidate: true, isValueChange: true}
    if (!inputMemo.trim() || !validateInputAddress()) {
      ret = {
        isValidate: false,
      }
    }
    ret.isValueChange =
      inputMemo.trim() !== memo.trim() || inputAddress !== address
    return ret
  }

  const onUpdateInsertMemo = async isValueChange => {
    if (!isValueChange) {
      return onSubmitCallback?.()
    }
    if (!isNumber(memoId)) {
      // can not add twice
      const addedMemo = await queryAddressMemo()
      if (addedMemo?.data?.length) {
        return setAddressErrorMsg(t('addedContactWarning'))
      }
    }

    const ret = await updateInsertMemo()
    ret && onSubmitCallback?.()
  }

  const onSubmitForm = async () => {
    try {
      const {isValidate, isValueChange} = onValidate()
      if (!isValidate) {
        return
      }
      isValueChange && setLoading(true)
      await onUpdateInsertMemo(isValueChange)
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
    if (showAddressInput || showMemoInput) {
      try {
        const {isValidate, isValueChange} = onValidate()
        if (isValidate) {
          isValueChange && setLoading(true)
          await onUpdateInsertMemo(isValueChange)
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
    setShowAddressInput(address === '' ? true : false)
  }, [address])

  useEffect(() => {
    let timer = null
    if (memo === '' || (isNumber(memoId) && editMemo)) {
      setShowMemoInput(true)
      timer = setTimeout(() => {
        memoTextInputRef?.current?.focus?.()
      })
    } else {
      setShowMemoInput(false)
    }
    return () => {
      clearTimeout(timer)
    }
  }, [memo, editMemo, memoId])

  useClickAway(containerRef, () => {
    onClickAway()
  })

  return (
    <div className="w-full">
      <div
        className={`flex items-center rounded shadow-fluent-4 ${
          showAddressInput || showMemoInput
            ? 'bg-primary-10'
            : 'bg-white hover:bg-primary-10'
        } p-3 ${containerClassName}`}
        id={itemId || `contact-${address}`}
        ref={containerRef}
      >
        <div className="flex items-center">
          <Avatar
            className="w-7.5 h-7.5 mr-2"
            diameter={30}
            address={address}
          />
          <div>
            {memoOverlay || (
              <TextField
                width="w-[170px]"
                className="text-gray-80 font-medium mb-0.5"
                inputClassName="overflow-hidden !rounded-sm"
                inputInnerClassName="!text-xs !bg-white"
                placeholder={t('name')}
                triggerEnter={true}
                triggerBlur={false}
                maxLength={null}
                textValue={memo}
                inputValue={inputMemo}
                showInputStatus={showMemoInput}
                onInputChange={memo => setInputMemo(memo)}
                onSubmit={onSubmitForm}
                ref={memoTextInputRef}
              />
            )}
            <TextField
              width="w-[170px]"
              className="text-gray-40"
              fontSize="text-xs"
              inputClassName={`overflow-hidden !rounded-sm ${
                addressErrorMsg ? '!border-error' : ''
              }`}
              inputInnerClassName="!text-xs !bg-white"
              placeholder={t('address')}
              triggerEnter={true}
              triggerBlur={false}
              maxLength={null}
              textValue={address}
              inputValue={inputAddress}
              showInputStatus={showAddressInput}
              onInputChange={address => setInputAddress(address)}
              onSubmit={onSubmitForm}
              isAddress={true}
            />
          </div>
        </div>
        <div className="flex-1">
          {showAddressInput || showMemoInput ? (
            <div className="flex w-full h-full justify-end items-center">
              <CheckCircleFilled
                className="w-5 h-5 cursor-pointer text-white"
                strokeColor={inputMemo.trim() ? '#6FC5B1' : '#ccc'}
                onClick={onSubmitForm}
                id="update-memo"
              />
            </div>
          ) : rightComponent ? (
            rightComponent
          ) : null}
        </div>
      </div>
      <div className="text-xs text-error ml-[46px]"> {addressErrorMsg}</div>
    </div>
  )
}
ContactItem.propTypes = {
  itemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  address: PropTypes.string,
  memo: PropTypes.string,
  memoOverlay: PropTypes.node,
  memoId: PropTypes.number,
  onSubmitCallback: PropTypes.func,
  onClickAwayCallback: PropTypes.func,
  editMemo: PropTypes.bool,
  rightComponent: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.string,
  ]),
  containerClassName: PropTypes.string,
}
export default ContactItem
