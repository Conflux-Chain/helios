import PropTypes from 'prop-types'
import {useRPC} from '@fluent-wallet/use-rpc'
import {RightOutlined} from '@fluent-wallet/component-icons'
import {RPC_METHODS} from '../../../constants'
const {GET_CURRENT_NETWORK} = RPC_METHODS

function CurrentNetwork({onOpen}) {
  const {data: currentNetwork} = useRPC([GET_CURRENT_NETWORK], undefined, {
    fallbackData: {},
  })
  const {name, icon} = currentNetwork

  return (
    <div
      className="flex bg-[#f0f3ff] bg-opacity-20 rounded h-6 px-2 cursor-pointer items-center"
      onClick={onOpen}
      aria-hidden="true"
    >
      <img
        className="w-2.5 h-2.5 mr-1"
        src={icon || 'images/default-network-icon.svg'}
        alt="logo"
      />
      <span className="text-2xs text-white mr-1">{name}</span>
      <RightOutlined className="w-2 h-2 text-white" />
    </div>
  )
}
CurrentNetwork.propTypes = {
  onOpen: PropTypes.func.isRequired,
}
export default CurrentNetwork
