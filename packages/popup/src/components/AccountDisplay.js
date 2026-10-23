import {shortenAddress} from '@fluent-wallet/shorten-address'
import Avatar from './Avatar'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import {formatIntoChecksumAddress} from '../utils'
function AccountDisplay({
  address,
  nickname,
  showAvatar = true,
  wrapperClassName,
  iconClassName,
  addressClassName,
  nicknameClassName,
}) {
  const displayAddress = address
    ? shortenAddress(formatIntoChecksumAddress(address))
    : ''

  return (
    <div
      className={classNames('flex items-center', wrapperClassName)}
      id="accountDisplay"
    >
      {showAvatar && (
        <Avatar
          className={classNames(
            'w-8 h-8 flex items-center justify-center rounded-full bg-gray-0 mr-2',
            iconClassName,
          )}
          diameter={30}
          address={address}
        />
      )}
      <div className="flex flex-col">
        <span
          className={classNames(
            'text-sm font-normal text-gray-80',
            addressClassName,
          )}
        >
          {displayAddress}
        </span>
        <span
          className={classNames(
            'text-xs font-normal text-gray-60',
            nicknameClassName,
          )}
        >
          {nickname}
        </span>
      </div>
    </div>
  )
}
AccountDisplay.propTypes = {
  address: PropTypes.string,
  nickname: PropTypes.string,
  showAvatar: PropTypes.bool,
  wrapperClassName: PropTypes.string,
  iconClassName: PropTypes.string,
  addressClassName: PropTypes.string,
  nicknameClassName: PropTypes.string,
}
export default AccountDisplay
