import {shortenAddress} from '@fluent-wallet/shorten-address'
import {useCurrentAccount} from '../hooks'

function CurrentAccountDisplay() {
  const {nickname, icon, address} = useCurrentAccount()
  const displayAddress = address ? shortenAddress(address) : ''

  return (
    <div className="flex items-center">
      <img src={icon} alt="avatar" className="w-8 h-8" />
      <div className="flex flex-col">
        <span className="text-xs text-gray-40">{nickname}</span>
        <span className="text-gray-80 font-medium">{displayAddress}</span>
      </div>
    </div>
  )
}
export default CurrentAccountDisplay
