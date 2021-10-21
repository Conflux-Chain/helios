import {shortenAddress} from '@fluent-wallet/shorten-address'
import {Avatar} from '.'
import PropTypes from 'prop-types'

function AccountDisplay({address, accountId, nickname}) {
  const displayAddress = address ? shortenAddress(address) : ''

  return (
    <div className="flex items-center">
      <Avatar
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-0 mr-2"
        diameter={30}
        accountId={accountId}
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
  accountId: PropTypes.number,
  nickname: PropTypes.string,
}
export default AccountDisplay
