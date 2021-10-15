import {useRPC} from '@fluent-wallet/use-rpc'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {useAddress} from '../hooks'
import {RPC_METHODS} from '../constants'
const {GET_CURRENT_ACCOUNT} = RPC_METHODS

function CurrentAccountDisplay() {
  const {data: currentAccount} = useRPC([GET_CURRENT_ACCOUNT], undefined, {
    fallbackData: {},
  })
  const {nickname, icon} = currentAccount

  const address = useAddress()
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
