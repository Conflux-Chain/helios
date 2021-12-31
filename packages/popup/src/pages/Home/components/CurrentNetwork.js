import PropTypes from 'prop-types'
import {RightOutlined} from '@fluent-wallet/component-icons'
import Text from '../../../components/Text'
import {useCurrentAddress} from '../../../hooks/useApi'

function CurrentNetwork({onOpenNetwork}) {
  const {
    data: {
      network: {icon, name},
    },
  } = useCurrentAddress()

  return (
    <div
      className="flex bg-[#f0f3ff] hover:bg-opacity-30 bg-opacity-20 rounded h-6 px-2 cursor-pointer items-center"
      id="openNetworkBtn"
      onClick={onOpenNetwork}
      aria-hidden="true"
    >
      <img
        className="w-2.5 h-2.5 mr-1"
        src={icon || '/images/default-network-icon.svg'}
        alt="logo"
      />
      <Text className="text-2xs text-white mr-1" text={name} />
      <RightOutlined className="w-2 h-2 text-white" />
    </div>
  )
}
CurrentNetwork.propTypes = {
  onOpenNetwork: PropTypes.func.isRequired,
}
export default CurrentNetwork
