import PropTypes from 'prop-types'
import {Avatar} from '.'

function AccountItem({
  className = '',
  accountId,
  address = '',
  accountNickname = '',
  showAvatar = true,
  rightComponent,
  AccountNameOverlay,
  onClickAccount,
}) {
  return (
    <div
      aria-hidden="true"
      className={`flex px-3 py-3.5 rounded hover:bg-primary-10 items-center ${className}`}
      id={`account-${accountId}`}
      onClick={() => onClickAccount?.()}
    >
      {showAvatar && (
        <Avatar className="w-5 h-5 mr-2" diameter={20} address={address} />
      )}
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
  showAvatar: PropTypes.bool,
  accountId: PropTypes.number,
  className: PropTypes.string,
  address: PropTypes.string,
  accountNickname: PropTypes.string,
  AccountNameOverlay: PropTypes.node,
  rightComponent: PropTypes.node,
  onClickAccount: PropTypes.func,
}

export default AccountItem
