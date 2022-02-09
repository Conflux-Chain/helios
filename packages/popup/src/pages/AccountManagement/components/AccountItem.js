import PropTypes from 'prop-types'
import {useState} from 'react'
import {useSWRConfig} from 'swr'
import {isNumber} from '@fluent-wallet/checks'
import Message from '@fluent-wallet/component-message'
import {useTranslation} from 'react-i18next'
import {KeyOutlined} from '@fluent-wallet/component-icons'
import {
  Avatar,
  WrapIcon,
  SwitchButtonGroup,
  TextField,
} from '../../../components'
import {RPC_METHODS} from '../../../constants'
import {request, updateDbAccountList} from '../../../utils'

const {
  WALLET_EXPORT_ACCOUNT,
  WALLET_DELETE_ACCOUNT_GROUP,
  WALLET_UPDATE_ACCOUNT,
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
  const {mutate} = useSWRConfig()
  const [inputNickname, setInputNickname] = useState(accountNickname)
  const [hidingAccountStatus, setHidingAccountStatus] = useState(false)

  const updateAccount = params => {
    return new Promise((resolve, reject) => {
      request(WALLET_UPDATE_ACCOUNT, params)
        .then(() => {
          updateDbAccountList(
            mutate,
            'accountManagementQueryAccount',
            'queryAllAccount',
          ).then(resolve)
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

  const onTextFieldBlur = () => {
    return updateAccount.call(this, {accountId, nickname: inputNickname})
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

  const onDeletePkAccountGroup = () => {
    if (isNumber(currentAccountId)) {
      if (accountId === currentAccountId) {
        return Message.warning({
          content: t('groupDeleteWarning'),
          top: '10px',
          duration: 1,
        })
      }
      onOpenConfirmPassword?.(WALLET_DELETE_ACCOUNT_GROUP, {
        accountGroupId,
      })
    }
  }

  return (
    <div
      aria-hidden="true"
      className="flex px-3 py-3.5 rounded hover:bg-primary-4 items-center"
    >
      <Avatar
        className="w-5 h-5 mr-2"
        diameter={20}
        accountIdentity={accountId}
      />
      <div className="flex-1 flex items-center">
        <TextField
          textValue={accountNickname}
          inputValue={inputNickname}
          onInputBlur={onTextFieldBlur}
          onInputChange={setInputNickname}
          className="text-gray-80"
        />
      </div>
      <WrapIcon
        size="w-5 h-5"
        id="export-account"
        onClick={() => {
          onOpenConfirmPassword?.(WALLET_EXPORT_ACCOUNT, {
            accountId,
          })
        }}
      >
        <KeyOutlined className="w-3 h-3 text-primary" />
      </WrapIcon>
      {groupType !== 'pk' && (
        <SwitchButtonGroup
          showLeft={hidden}
          onSwitch={onSwitchAccount}
          Wrapper={WrapIcon}
          containerClassName="w-5 h-5 ml-3"
        />
      )}
      {/* delete pk account group */}
      {groupType === 'pk' && showDelete && (
        <div
          aria-hidden="true"
          className="text-xs cursor-pointer text-gray-60 hover:text-primary ml-3"
          onClick={onDeletePkAccountGroup}
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
