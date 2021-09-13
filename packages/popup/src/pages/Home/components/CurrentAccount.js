import {useRPC} from '@cfxjs/use-rpc'
import {ArrowRight} from '@cfxjs/component-icons'
import {
  GET_CURRENT_ACCOUNT,
  GET_CURRENT_NETWORK,
} from '../../../constants/rpcDeps'

function CurrentAccount() {
  const {data: currentNetwork} = useRPC(GET_CURRENT_NETWORK, undefined, {
    fallbackData: {},
  })
  const {networkId} = currentNetwork
  const {data: currentAccount} = useRPC(
    GET_CURRENT_ACCOUNT.push(networkId),
    undefined,
    {fallbackData: {}},
  )
  const {nickname} = currentAccount
  return (
    <div className="flex flex-col">
      <div className="flex items-center cursor-pointer">
        <span className="text-xs text-gray-40 mr-2">{nickname}</span>
        <ArrowRight className="w-3 h-3 text-white" />
      </div>
      <div className="flex items-center"></div>
    </div>
  )
}

export default CurrentAccount
