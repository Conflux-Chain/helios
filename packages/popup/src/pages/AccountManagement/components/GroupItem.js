import PropTypes from 'prop-types'
import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import Message from '@fluent-wallet/component-message'
import {RPC_METHODS} from '../../../constants'
import {AccountItem} from './'
import {TextField, WrapIcon} from '../../../components'

const {
  WALLET_EXPORT_ACCOUNT_GROUP,
  WALLET_DELETE_ACCOUNT_GROUP,
  WALLET_UPDATE_ACCOUNT_GROUP,
} = RPC_METHODS

function GroupItem({
  nickname,
  account,
  currentNetworkId,
  showDelete = false,
  groupType = '',
  onOpenConfirmPassword,
  accountGroupId,
  updateEditedName,
}) {
  const {t} = useTranslation()
  const [inputNickname, setInputNickname] = useState(nickname)

  const onDeleteAccountGroup = () => {
    if (account.find(({selected}) => !!selected)) {
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
  const onTextFieldBlur = () => {
    return updateEditedName(
      {
        accountGroupId,
        nickname: inputNickname,
      },
      WALLET_UPDATE_ACCOUNT_GROUP,
    )
  }

  return (
    <div className="bg-gray-0 rounded mt-3 mx-3">
      {groupType === 'pk' ? null : (
        <div className="flex items-center ml-3 pt-2.5 mb-0.5">
          {groupType === 'hd' && (
            <WrapIcon size="w-5 h-5 mr-1 bg-primary-4" clickable={false}>
              <img src="/images/seed-group-icon.svg" alt="group-icon" />
            </WrapIcon>
          )}
          <TextField
            textValue={nickname}
            inputValue={inputNickname}
            onInputBlur={onTextFieldBlur}
            onInputChange={setInputNickname}
            className="text-gray-40 ml-1"
            fontSize="!text-xs"
            height="!h-4"
          />
        </div>
      )}
      {account.map(({nickname, eid, hidden, selected}) => (
        <AccountItem
          key={eid}
          accountId={eid}
          accountGroupId={accountGroupId}
          accountNickname={nickname}
          groupType={groupType}
          showDelete={showDelete}
          hidden={hidden}
          selected={selected}
          onOpenConfirmPassword={onOpenConfirmPassword}
          currentNetworkId={currentNetworkId}
          updateEditedName={updateEditedName}
        />
      ))}
      {groupType === 'hd' && (
        <div className="flex justify-between mx-3 py-4 border-t border-gray-10 text-xs cursor-pointer text-gray-60">
          <div
            className="hover:text-primary"
            onClick={() =>
              onOpenConfirmPassword?.(WALLET_EXPORT_ACCOUNT_GROUP, {
                accountGroupId,
              })
            }
            aria-hidden="true"
          >
            {t('viewSeed')}
          </div>
          {showDelete && (
            <div
              aria-hidden="true"
              className="hover:text-primary"
              onClick={onDeleteAccountGroup}
            >
              {t('delete')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

GroupItem.propTypes = {
  nickname: PropTypes.string,
  accountGroupId: PropTypes.number,
  currentNetworkId: PropTypes.number,
  account: PropTypes.array,
  groupType: PropTypes.string,
  showDelete: PropTypes.bool,
  onOpenConfirmPassword: PropTypes.func,
  updateEditedName: PropTypes.func.isRequired,
}

export default GroupItem
