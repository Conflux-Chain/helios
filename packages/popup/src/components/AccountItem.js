import PropTypes from 'prop-types'
import {Avatar} from '.'

function AccountItem({
  accountId = '',
  accountNickname = '',
  rightComponent,
  AccountNameOverlay,
}) {
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
        {AccountNameOverlay || (
          <p className="text-xs text-gray-40 ">{accountNickname}</p>
        )}
      </div>
      {rightComponent}
    </div>
  )
}

AccountItem.propTypes = {
  accountId: PropTypes.number,
  accountNickname: PropTypes.string,

  AccountNameOverlay: PropTypes.node,
  rightComponent: PropTypes.node,
}

export default AccountItem
