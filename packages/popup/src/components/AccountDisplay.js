import {shortenAddress} from '@fluent-wallet/shorten-address'
import Avatar from './Avatar'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import {formatIntoChecksumAddress} from '../utils'
function AccountDisplay({
  address,
  nickname,
  showAvatar = true,
  addressClassName,
  nicknameClassName,
}) {
  const displayAddress = address
    ? shortenAddress(formatIntoChecksumAddress(address))
    : ''

  return (
    <div className="flex items-center" id="accountDisplay">
      {showAvatar && (
        <Avatar
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-0 mr-2"
          diameter={30}
          address={address}
        />
      )}
      <div className="flex flex-col">
        <span className={classNames('text-xs text-gray-40', nicknameClassName)}>
          {nickname}
        </span>
        <span
          className={classNames('text-gray-80 font-medium', addressClassName)}
        >
          {displayAddress}
        </span>
      </div>
    </div>
  )
}
AccountDisplay.propTypes = {
  address: PropTypes.string,
  nickname: PropTypes.string,
  showAvatar: PropTypes.bool,
  addressClassName: PropTypes.string,
  nicknameClassName: PropTypes.string,
}
export default AccountDisplay
