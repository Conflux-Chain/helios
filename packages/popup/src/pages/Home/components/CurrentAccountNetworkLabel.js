import {useCurrentAddress} from '../../../hooks/useApi'
import {Avatar} from '../../../components'

function CurrentAccountNetworkLabel() {
  const {data: curAddr} = useCurrentAddress()
  return (
    <div className="flex items-center text-xs mt-1">
      <Avatar
        className="w-3 h-3 mr-1"
        accountId={curAddr.account?.eid}
        diameter={12}
      />
      <div className="text-gray-40">{curAddr.account?.nickname || ''}</div>
      <div className="mx-2 w-px h-2 bg-gray-40" />
      <img
        alt="network"
        src={curAddr.network?.icon || '/images/default-network-icon.svg'}
        className="w-3 h-3 mr-1"
      />
      <div className="text-gray-60">{curAddr.network?.name || ''}</div>
    </div>
  )
}

export default CurrentAccountNetworkLabel
