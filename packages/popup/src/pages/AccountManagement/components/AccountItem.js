import PropTypes from 'prop-types'
import {useState} from 'react'
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

const {
  WALLET_EXPORT_ACCOUNT,
  WALLET_DELETE_ACCOUNT_GROUP,
  WALLET_UPDATE_ACCOUNT,
  WALLET_DELETE_ACCOUNT,
  ACCOUNT_GROUP_TYPE,
} = RPC_METHODS

function AccountItem({
  groupType = '',
  accountId = '',
  accountGroupId = '',
  accountNickname = '',
  showDelete = false,
  hidden = false,
  selected = false,
  onOpenConfirmPassword,
  updateEditedName,
}) {
  const {t} = useTranslation()
  const [inputNickname, setInputNickname] = useState(accountNickname)
  const [hidingAccountStatus, setHidingAccountStatus] = useState(false)

  const onTextFieldBlur = () => {
    return updateEditedName(
      {accountId, nickname: inputNickname},
      WALLET_UPDATE_ACCOUNT,
    )
  }

  const onSwitchAccount = hidden => {
    if (hidingAccountStatus) {
      return
    }
    if (selected) {
      return Message.warning({
        content: t('accountHideWarning'),
        top: '10px',
        duration: 1,
      })
    }
    setHidingAccountStatus(true)
    updateEditedName({accountId, hidden}, WALLET_UPDATE_ACCOUNT).finally(() => {
      setHidingAccountStatus(false)
    })
  }

  const onDeletePkAccountGroup = () => {
    if (selected) {
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

  const onDeleteHwAccount = () => {
    if (selected) {
      return Message.warning({
        content: t('accountDeleteWarning'),
        top: '10px',
        duration: 1,
      })
    }
    onOpenConfirmPassword?.(WALLET_DELETE_ACCOUNT, {
      accountId,
    })
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
      {groupType !== ACCOUNT_GROUP_TYPE.HW && (
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
      )}
      {groupType === ACCOUNT_GROUP_TYPE.HD && (
        <SwitchButtonGroup
          showLeft={hidden}
          onSwitch={onSwitchAccount}
          Wrapper={WrapIcon}
          containerClassName="w-5 h-5 ml-3"
        />
      )}
      {/* delete hw account  */}
      {groupType === ACCOUNT_GROUP_TYPE.HW && (
        <div
          aria-hidden="true"
          className="text-xs cursor-pointer text-gray-60 hover:text-primary ml-3"
          onClick={onDeleteHwAccount}
        >
          {t('delete')}
        </div>
      )}
      {/* delete pk account group */}
      {groupType === ACCOUNT_GROUP_TYPE.PK && showDelete && (
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
  selected: PropTypes.bool,
  hidden: PropTypes.bool,
  accountNickname: PropTypes.string,
  onOpenConfirmPassword: PropTypes.func,
  updateEditedName: PropTypes.func.isRequired,
}

export default AccountItem
