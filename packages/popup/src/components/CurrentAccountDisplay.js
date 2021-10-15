import {useRPC} from '@fluent-wallet/use-rpc'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {RPC_METHODS, NETWORK_TYPE} from '../constants'
const {
  GET_CURRENT_ACCOUNT,
  GET_CURRENT_NETWORK,
  GET_ACCOUNT_ADDRESS_BY_NETWORK,
} = RPC_METHODS

function CurrentAccountDisplay() {
  const {data: currentNetwork} = useRPC([GET_CURRENT_NETWORK], undefined, {
    fallbackData: {},
  })
  const {eid: networkId, type} = currentNetwork

  const {data: currentAccount} = useRPC([GET_CURRENT_ACCOUNT], undefined, {
    fallbackData: {},
  })
  const {nickname, eid: accountId, icon} = currentAccount

  const {data: accountAddress} = useRPC(
    accountId !== undefined && networkId !== undefined
      ? [GET_ACCOUNT_ADDRESS_BY_NETWORK, accountId, networkId]
      : null,
    {accountId, networkId},
    {fallbackData: {}},
  )
  const {base32, hex} = accountAddress

  const address =
    type === NETWORK_TYPE.CFX ? base32 : type === NETWORK_TYPE.ETH ? hex : ''
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
