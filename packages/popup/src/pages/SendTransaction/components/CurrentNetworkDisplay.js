import PropTypes from 'prop-types'

function CurrentNetworkDisplay({name, icon}) {
  return (
    <div
      className="flex rounded h-6 pl-2 items-center"
      id="currentNetworkContainer"
    >
      <img
        className="w-4 h-4 mr-1"
        src={icon || '/images/default-network-icon.svg'}
        alt="logo"
      />
      <span className="text-sm text-gray-80">{name}</span>
    </div>
  )
}

CurrentNetworkDisplay.propTypes = {
  name: PropTypes.string,
  icon: PropTypes.string,
}

export default CurrentNetworkDisplay
