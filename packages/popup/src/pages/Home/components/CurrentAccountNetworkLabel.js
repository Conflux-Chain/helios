import {useRPC} from '@fluent-wallet/use-rpc'
import {RPC_METHODS} from '../../../constants'
const {GET_CURRENT_NETWORK, GET_CURRENT_ACCOUNT} = RPC_METHODS

function CurrentAccountNetworkLabel() {
  const {data: currentAccountData} = useRPC([GET_CURRENT_ACCOUNT])
  const {data: currentNetworkData} = useRPC([GET_CURRENT_NETWORK])

  return (
    <div className="flex items-center text-xs mt-1">
      <img className="w-3 h-3 mr-1" src="" alt="avatar" />
      <div className="text-gray-40">{currentAccountData?.nickname || ''}</div>
      <div className="mx-2 w-px h-2 bg-gray-40" />
      <img
        alt="network"
        src={currentNetworkData?.icon || 'images/default-network-icon.svg'}
        className="w-3 h-3 mr-1"
      />
      <div className="text-gray-60">{currentNetworkData?.name || ''}</div>
    </div>
  )
}

export default CurrentAccountNetworkLabel
