import PropTypes from 'prop-types'
import {RightOutlined} from '@fluent-wallet/component-icons'
import {useCurrentAddress} from '../../../hooks/useApi'

function CurrentNetwork({onOpenNetwork}) {
  const {data: curAddr} = useCurrentAddress()

  return (
    <div
      className="flex bg-[#f0f3ff] bg-opacity-20 rounded h-6 px-2 cursor-pointer items-center"
      id="openNetworkBtn"
      onClick={onOpenNetwork}
      aria-hidden="true"
    >
      <img
        className="w-2.5 h-2.5 mr-1"
        src={curAddr.network?.icon || '/images/default-network-icon.svg'}
        alt="logo"
      />
      <span className="text-2xs text-white mr-1">{curAddr.network?.name}</span>
      <RightOutlined className="w-2 h-2 text-white" />
    </div>
  )
}
CurrentNetwork.propTypes = {
  onOpenNetwork: PropTypes.func.isRequired,
}
export default CurrentNetwork
