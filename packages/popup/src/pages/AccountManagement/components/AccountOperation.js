import PropTypes from 'prop-types'
import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import Message from '@fluent-wallet/component-message'
import {KeyOutlined} from '@fluent-wallet/component-icons'

import {WrapIcon, SwitchButtonGroup} from '../../../components'
import {RPC_METHODS} from '../../../constants'

const {
  WALLET_EXPORT_ACCOUNT,
  WALLET_UPDATE_ACCOUNT,
  WALLET_DELETE_ACCOUNT,
  WALLET_DELETE_ACCOUNT_GROUP,
  ACCOUNT_GROUP_TYPE,
} = RPC_METHODS

function AccountOperation({
  groupType,
  accountId,
  accountGroupId,
  hidden = false,
  selected = false,
  showDelete = false,
  accounts = [],
  updateEditedName,
  onOpenConfirmPassword,
}) {
  const {t} = useTranslation()

  const [hidingAccountStatus, setHidingAccountStatus] = useState(false)

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

    const remainShowAccounts = accounts.filter(({hidden}) => !hidden)

    // Each hd account group must have at least one displayed account
    if (
      remainShowAccounts.length === 1 &&
      remainShowAccounts?.[0]?.eid === accountId &&
      hidden
    ) {
      return Message.warning({
        content: t('lastAccountHideWarning'),
        top: '10px',
        duration: 1,
      })
    }

    setHidingAccountStatus(true)
    updateEditedName({accountId, hidden}, WALLET_UPDATE_ACCOUNT).finally(() => {
      setHidingAccountStatus(false)
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

  return (
    <div className="flex items-center">
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
          id="delete-hw-account"
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
          id="delete-account-group"
          className="text-xs cursor-pointer text-gray-60 hover:text-primary ml-3"
          onClick={onDeletePkAccountGroup}
        >
          {t('delete')}
        </div>
      )}
    </div>
  )
}

AccountOperation.propTypes = {
  groupType: PropTypes.string,
  accountId: PropTypes.number,
  accountGroupId: PropTypes.number,
  hidden: PropTypes.bool,
  selected: PropTypes.bool,
  showDelete: PropTypes.bool,
  accounts: PropTypes.array,
  onOpenConfirmPassword: PropTypes.func,
  updateEditedName: PropTypes.func.isRequired,
}
export default AccountOperation
