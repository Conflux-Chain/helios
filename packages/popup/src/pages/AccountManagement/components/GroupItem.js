import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {RPC_METHODS} from '../../../constants'
import {AccountItem} from './'
const {WALLET_EXPORT_ACCOUNT_GROUP} = RPC_METHODS

function GroupItem({
  nickname,
  account,
  groupType = '',
  onOpenConfirmPassword,
  accountGroupEid,
}) {
  const {t} = useTranslation()

  return (
    <div className="bg-gray-0 rounded mt-3 mx-3">
      {groupType === 'pk' ? null : (
        <p className="text-gray-40 ml-4 mb-1 text-xs pt-3">{nickname}</p>
      )}
      {account.map(({nickname, eid}) => (
        <AccountItem
          key={eid}
          accountEid={eid}
          accountNickname={nickname}
          groupType={groupType}
          onOpenConfirmPassword={onOpenConfirmPassword}
        />
      ))}
      {groupType === 'hd' ? (
        <div className="flex justify-between mx-3 py-4 border-t border-gray-10 text-xs cursor-pointer text-gray-60 hover:text-primary">
          <div
            onClick={() =>
              onOpenConfirmPassword &&
              onOpenConfirmPassword(
                WALLET_EXPORT_ACCOUNT_GROUP,
                accountGroupEid,
              )
            }
            aria-hidden="true"
          >
            {t('viewSeed')}
          </div>
          <div aria-hidden="true">{t('hide')}</div>
        </div>
      ) : null}
    </div>
  )
}

GroupItem.propTypes = {
  nickname: PropTypes.string,
  accountGroupEid: PropTypes.number,
  account: PropTypes.array,
  groupType: PropTypes.string,
  onOpenConfirmPassword: PropTypes.func,
}

export default GroupItem
