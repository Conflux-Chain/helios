import PropTypes from 'prop-types'
import {useState, useRef} from 'react'
import {useSWRConfig} from 'swr'
import {isNumber} from '@fluent-wallet/checks'
import Input from '@fluent-wallet/component-input'
import Message from '@fluent-wallet/component-message'
import {useTranslation} from 'react-i18next'
import {
  KeyOutlined,
  EditOutlined,
  LeftSwitchOutlined,
  RightSwitchOutlined,
} from '@fluent-wallet/component-icons'
import {Avatar, WrapIcon} from '../../../components'
import {RPC_METHODS} from '../../../constants'
import {request} from '../../../utils'
import useLoading from '../../../hooks/useLoading'

const {
  WALLET_EXPORT_ACCOUNT,
  WALLET_DELETE_ACCOUNT_GROUP,
  WALLET_UPDATE_ACCOUNT,
  WALLETDB_ACCOUNT_LIST_ASSETS,
  ACCOUNT_GROUP_TYPE,
} = RPC_METHODS

function AccountItem({
  groupType = '',
  accountId = '',
  accountGroupId = '',
  accountNickname = '',
  showDelete = false,
  hidden = false,
  onOpenConfirmPassword,
  currentAccountId,
}) {
  const {t} = useTranslation()
  const inputRef = useRef(null)
  const {mutate} = useSWRConfig()
  const {setLoading} = useLoading()
  const [showInputStatus, setShowInputStatus] = useState(false)
  const [showEditIconStatus, setShowEditIconStatus] = useState(false)
  const [inputNickname, setInputNickname] = useState(accountNickname)
  const [hidingAccountStatus, setHidingAccountStatus] = useState(false)

  const onClickEditBtn = () => {
    setShowInputStatus(true)
    setTimeout(() => {
      inputRef.current.focus()
    })
  }

  const updateAccount = params => {
    return new Promise((resolve, reject) => {
      request(WALLET_UPDATE_ACCOUNT, params)
        .then(() => {
          mutate([
            WALLETDB_ACCOUNT_LIST_ASSETS,
            ACCOUNT_GROUP_TYPE.HD,
            ACCOUNT_GROUP_TYPE.PK,
          ]).then(resolve)
        })
        .catch(e => {
          Message.error({
            content:
              e?.message?.split?.('\n')?.[0] ??
              e?.message ??
              t('unCaughtErrMsg'),
            top: '10px',
            duration: 1,
          })
          reject()
        })
    })
  }

  const onInputBlur = () => {
    if (inputNickname === accountNickname || !inputNickname) {
      !inputNickname && setInputNickname(accountNickname)
      return setShowInputStatus(false)
    }
    setLoading(true)
    updateAccount({accountId, nickname: inputNickname})
      .then(() => {
        setLoading(false)
        setShowInputStatus(false)
      })
      .catch(() => {
        setLoading(false)
        setShowInputStatus(false)
        setInputNickname(accountNickname)
      })
  }

  const onSwitchAccount = hidden => {
    if (hidingAccountStatus) {
      return
    }
    if (isNumber(currentAccountId)) {
      if (accountId === currentAccountId) {
        return Message.warning({
          content: t('accountHideWarning'),
          top: '10px',
          duration: 1,
        })
      }
      setHidingAccountStatus(true)
      updateAccount({accountId, hidden}).finally(() => {
        setHidingAccountStatus(false)
      })
    }
  }

  return (
    <div
      aria-hidden="true"
      className="flex px-3 py-3.5 rounded hover:bg-primary-4 items-center"
      onMouseEnter={() => setShowEditIconStatus(true)}
      onMouseLeave={() => setShowEditIconStatus(false)}
    >
      <Avatar
        className="w-5 h-5 mr-2"
        diameter={20}
        accountIdentity={accountId}
      />
      <div className="flex-1 flex items-center text-ellipsis">
        <div className="text-gray-80 relative h-[18px]">
          {!showInputStatus && (
            <div className="flex">
              <div className="text-ellipsis max-w-[188px] text-sm">
                {accountNickname}
              </div>
              {showEditIconStatus && (
                <EditOutlined
                  className={
                    'ml-2 w-4 h-4 cursor-pointer text-gray-60 hover:text-primary'
                  }
                  id="edit-accountNickname"
                  onClick={onClickEditBtn}
                />
              )}
            </div>
          )}
          {
            <Input
              width="w-[188px]"
              maxLength="20"
              containerClassName={`border-none absolute -top-px left-0 bg-transparent text-sm h-[18px] ${
                showInputStatus ? 'visible' : 'invisible'
              }`}
              className="!p-0 text-gray-60"
              ref={inputRef}
              value={inputNickname}
              onChange={e => setInputNickname(e.target.value)}
              onBlur={onInputBlur}
            />
          }
        </div>
      </div>
      <WrapIcon
        size="w-5 h-5"
        id="open-scan-url"
        onClick={() => {
          onOpenConfirmPassword?.(WALLET_EXPORT_ACCOUNT, {
            accountId,
          })
        }}
      >
        <KeyOutlined className="w-3 h-3 text-primary" />
      </WrapIcon>
      <WrapIcon
        size="w-5 h-5 ml-3"
        id="switch-account"
        onClick={() => onSwitchAccount(!hidden)}
      >
        <div>
          {hidden ? (
            <LeftSwitchOutlined className="w-4 h-4 text-gray-40" />
          ) : (
            <RightSwitchOutlined className="w-4 h-4 text-primary" />
          )}
        </div>
      </WrapIcon>
      {/* delete pk account group */}
      {groupType === 'pk' && showDelete && (
        <div
          aria-hidden="true"
          className="text-xs cursor-pointer text-gray-60 hover:text-primary ml-3"
          onClick={() =>
            onOpenConfirmPassword?.(WALLET_DELETE_ACCOUNT_GROUP, {
              accountGroupId,
            })
          }
        >
          {t('delete')}
        </div>
      )}
    </div>
  )
}

AccountItem.propTypes = {
  groupType: PropTypes.string,
  accountId: PropTypes.number,
  accountGroupId: PropTypes.number,
  showDelete: PropTypes.bool,
  hidden: PropTypes.bool,
  accountNickname: PropTypes.string,
  onOpenConfirmPassword: PropTypes.func,
  currentAccountId: PropTypes.number,
}

export default AccountItem
