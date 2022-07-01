import PropTypes from 'prop-types'
import {RPC_METHODS} from '../constants'
import {WrapIcon} from '.'

const {ACCOUNT_GROUP_TYPE} = RPC_METHODS

function AccountGroupItem({
  className = '',
  groupContainerClassName = '',
  nickname = '',
  groupType = '',
  showGroupNameIcon = true,
  GroupNameOverlay,
  groupTag,
  groupFooter,
  children,
}) {
  return (
    <div className={`bg-gray-0 rounded mt-3 mx-3 relative ${className}`}>
      {groupType !== ACCOUNT_GROUP_TYPE.PK && (
        <div
          className={`flex items-center ml-3 pt-2.5 mb-0.5 ${groupContainerClassName}`}
        >
          {groupType === ACCOUNT_GROUP_TYPE.HD && showGroupNameIcon && (
            <WrapIcon size="w-5 h-5 mr-1" clickable={false}>
              <img src="/images/seed-group-icon.svg" alt="group-icon" />
            </WrapIcon>
          )}
          {GroupNameOverlay || (
            <p className="text-gray-40 text-xs">{nickname}</p>
          )}
        </div>
      )}
      {groupTag}
      {children}
      {groupFooter}
    </div>
  )
}

AccountGroupItem.propTypes = {
  className: PropTypes.string,
  groupContainerClassName: PropTypes.string,
  nickname: PropTypes.string,
  groupType: PropTypes.string,
  showGroupNameIcon: PropTypes.bool,
  GroupNameOverlay: PropTypes.node,
  groupTag: PropTypes.node,
  groupFooter: PropTypes.node,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
}

export default AccountGroupItem
