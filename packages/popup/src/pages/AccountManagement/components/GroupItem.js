import PropTypes from 'prop-types'
import {useState} from 'react'
import {useSWRConfig} from 'swr'
import {useTranslation} from 'react-i18next'
import {isNumber} from '@fluent-wallet/checks'
import Message from '@fluent-wallet/component-message'
import {RPC_METHODS} from '../../../constants'
import {AccountItem} from './'
import {TextField} from '../../../components'
import {request, updateDbAccountList} from '../../../utils'

const {
  WALLET_EXPORT_ACCOUNT_GROUP,
  WALLET_DELETE_ACCOUNT_GROUP,
  WALLET_UPDATE_ACCOUNT_GROUP,
} = RPC_METHODS

function GroupItem({
  nickname,
  account,
  currentAccountId,
  showDelete = false,
  groupType = '',
  onOpenConfirmPassword,
  accountGroupId,
}) {
  const {t} = useTranslation()
  const {mutate} = useSWRConfig()
  const [inputNickname, setInputNickname] = useState(nickname)

  const updateAccountGroup = params => {
    return new Promise((resolve, reject) => {
      request(WALLET_UPDATE_ACCOUNT_GROUP, params)
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

  const onDeleteAccountGroup = () => {
    if (isNumber(currentAccountId)) {
      if (account.find(({eid}) => eid === currentAccountId)) {
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
  const onTextFieldBlur = () => {
    return updateAccountGroup.call(this, {
      accountGroupId,
      nickname: inputNickname,
    })
  }

  return (
    <div className="bg-gray-0 rounded mt-3 mx-3">
      {groupType === 'pk' ? null : (
        <div className="pt-3">
          <TextField
            textValue={nickname}
            inputValue={inputNickname}
            onInputBlur={onTextFieldBlur}
            onInputChange={setInputNickname}
            className="text-gray-40 ml-4 mb-1"
            fontSize="!text-xs"
            height="!h-4"
          />
        </div>
      )}
      {account.map(({nickname, eid, hidden}) => (
        <AccountItem
          key={eid}
          accountId={eid}
          accountGroupId={accountGroupId}
          accountNickname={nickname}
          groupType={groupType}
          showDelete={showDelete}
          hidden={hidden}
          onOpenConfirmPassword={onOpenConfirmPassword}
          currentAccountId={currentAccountId}
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
  currentAccountId: PropTypes.number,
  account: PropTypes.array,
  groupType: PropTypes.string,
  showDelete: PropTypes.bool,
  onOpenConfirmPassword: PropTypes.func,
}

export default GroupItem
