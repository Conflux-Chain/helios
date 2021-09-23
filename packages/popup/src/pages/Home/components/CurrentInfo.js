import {useState, useEffect} from 'react'
import {useRPC} from '@fluent-wallet/use-rpc'
import {RPC_METHODS} from '../../../constants'

const {GET_CURRENT_NETWORK, GET_CURRENT_ACCOUNT} = RPC_METHODS

function CurrentInfo() {
  const [accountName, setAccountName] = useState('')
  const [networkName, setNetworkName] = useState('')
  const {data: currentAccountData} = useRPC([GET_CURRENT_ACCOUNT])
  const {data: currentNetworkData} = useRPC([GET_CURRENT_NETWORK])
  const [networkIconUrl, setNetworkIconUrl] = useState(null)

  useEffect(() => {
    setAccountName(currentAccountData?.nickname || '')
  }, [currentAccountData])

  useEffect(() => {
    setNetworkIconUrl(
      currentNetworkData?.icon || 'images/default-network-icon.svg',
    )
    setNetworkName(currentNetworkData?.name || '')
  }, [currentNetworkData])

  return (
    <div className="flex items-center text-xs mt-1">
      <img className="w-3 h-3 mr-1" src="" alt="avatar" />
      <div className="text-gray-40">{accountName}</div>
      <div className="mx-2 w-px h-2 bg-gray-40" />
      <img alt="network" src={networkIconUrl || ''} className="w-3 h-3 mr-1" />
      <div className="text-gray-60">{networkName}</div>
    </div>
  )
}

export default CurrentInfo
