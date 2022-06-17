import {shortenAddress} from '@fluent-wallet/shorten-address'
import {Avatar} from '.'
import PropTypes from 'prop-types'

import {formatIntoChecksumAddress} from '../utils'
function AccountDisplay({address, nickname}) {
  const displayAddress = address
    ? shortenAddress(formatIntoChecksumAddress(address))
    : ''

  return (
    <div className="flex items-center" id="accountDisplay">
      <Avatar
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-0 mr-2"
        diameter={30}
        address={address}
      />
      <div className="flex flex-col">
        <span className="text-xs text-gray-40">{nickname}</span>
        <span className="text-gray-80 font-medium">{displayAddress}</span>
      </div>
    </div>
  )
}
AccountDisplay.propTypes = {
  address: PropTypes.string,
  nickname: PropTypes.string,
}
export default AccountDisplay
