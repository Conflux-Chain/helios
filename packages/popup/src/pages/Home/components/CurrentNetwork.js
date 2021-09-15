import {useRPC} from '@fluent-wallet/use-rpc'
import {ArrowRight} from '@fluent-wallet/component-icons'
import {GET_CURRENT_NETWORK} from '../../../constants'

function CurrentNetwork() {
  const {data: currentNetwork} = useRPC([GET_CURRENT_NETWORK], undefined, {
    fallbackData: {},
  })
  const {nickname = 'Ethereum', icon} = currentNetwork

  return (
    <div className="flex bg-[#f0f3ff] bg-opacity-20 rounded h-6 px-2 cursor-pointer items-center">
      <img className="w-2.5 h-2.5 mr-1" src={icon} alt="logo" />
      <span className="text-2xs text-white mr-1">{nickname}</span>
      <ArrowRight className="w-2 h-2 text-white" />
    </div>
  )
}

export default CurrentNetwork
