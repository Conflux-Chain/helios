import PropTypes from 'prop-types'

import {useCurrentAddress} from '../hooks/useApi'

function CurrentNetworkDisplay({
  containerClassName = '',
  contentClassName = '',
  currentNetwork = {},
}) {
  const {
    data: {network},
  } = useCurrentAddress(!!Object.keys(currentNetwork).length)

  const name = currentNetwork?.name || network?.name
  const icon = currentNetwork?.icon || network?.icon

  return (
    <div
      className={`flex items-center ${containerClassName}`}
      id="currentNetworkContainer"
    >
      <img
        className="w-4 h-4 mr-1"
        src={icon || '/images/default-network-icon.svg'}
        alt="logo"
      />
      <span className={`text-sm text-gray-80 ${contentClassName}`}>{name}</span>
    </div>
  )
}

CurrentNetworkDisplay.propTypes = {
  containerClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  currentNetwork: PropTypes.object,
}

export default CurrentNetworkDisplay
