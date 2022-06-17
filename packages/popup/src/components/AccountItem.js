import PropTypes from 'prop-types'
import {Avatar} from '.'

function AccountItem({
  className = '',
  accountId,
  address = '',
  accountNickname = '',
  rightComponent,
  AccountNameOverlay,
  onClickAccount,
}) {
  return (
    <div
      aria-hidden="true"
      className={`flex px-3 py-3.5 rounded hover:bg-primary-4 items-center ${className}`}
      id={`account-${accountId}`}
      onClick={() => onClickAccount?.()}
    >
      <Avatar className="w-5 h-5 mr-2" diameter={20} address={address} />
      <div className="flex-1 flex items-center">
        {AccountNameOverlay || (
          <p className="text-xs text-gray-40">{accountNickname}</p>
        )}
      </div>
      {rightComponent}
    </div>
  )
}

AccountItem.propTypes = {
  className: PropTypes.string,
  accountId: PropTypes.number,
  address: PropTypes.string,
  accountNickname: PropTypes.string,
  AccountNameOverlay: PropTypes.node,
  rightComponent: PropTypes.node,
  onClickAccount: PropTypes.func,
}

export default AccountItem
