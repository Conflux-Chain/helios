import PropTypes from 'prop-types'
import {RightOutlined} from '@fluent-wallet/component-icons'
import {useCurrentNetwork} from '../../../hooks/useApi'

function CurrentNetwork({onOpenNetwork}) {
  const currentNetwork = useCurrentNetwork()
  const {name, icon} = currentNetwork

  return (
    <div
      className="flex bg-[#f0f3ff] bg-opacity-20 rounded h-6 px-2 cursor-pointer items-center"
      id="openNetworkBtn"
      onClick={onOpenNetwork}
      aria-hidden="true"
    >
      <img
        className="w-2.5 h-2.5 mr-1"
        src={icon || '/images/default-network-icon.svg'}
        alt="logo"
      />
      <span className="text-2xs text-white mr-1">{name}</span>
      <RightOutlined className="w-2 h-2 text-white" />
    </div>
  )
}
CurrentNetwork.propTypes = {
  onOpenNetwork: PropTypes.func.isRequired,
}
export default CurrentNetwork
