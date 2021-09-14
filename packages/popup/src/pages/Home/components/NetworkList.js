import PropTypes from 'prop-types'

// TODO: remove when avatar programme confirmed
// eslint-disable-next-line react/prop-types
function TemporaryIcon({className = ''}) {
  return (
    <div className={`inline-block bg-gray-40 rounded-full ${className}`}></div>
  )
}
const networkTypeColorObj = {
  mainnet: 'bg-primary-10 text-[#ACB6E0]',
  testnet: 'bg-[#FFF7F4] text-[#F5B797]',
  custom: 'bg-[#F0FDFC] text-[#83DBC6]',
}

function NetworkItem({networkName, networkType, networkIcon, closeAction}) {
  const networkTypeColor = networkTypeColorObj[networkType] || ''
  const onClickItem = () => {
    // TODO: set zustand
    closeAction && closeAction()
  }
  return (
    <div
      aria-hidden="true"
      className="bg-gray-0 mt-4 h-15 flex items-center pl-3.5 rounded relative cursor-pointer"
      onClick={onClickItem}
    >
      <div className="w-8 h-8 border border-solid border-gray-20 rounded-full text-center">
        {networkIcon}
      </div>
      <div className="ml-2.5 text-gray-80 text-sm font-medium">
        {networkName}
      </div>
      <div
        className={`text-2xs py-2 px-2 absolute right-0 top-0 rounded-bl-lg ${networkTypeColor}`}
      >
        {networkType}
      </div>
    </div>
  )
}
NetworkItem.propTypes = {
  networkName: PropTypes.string.isRequired,
  networkType: PropTypes.string.isRequired,
  networkIcon: PropTypes.element.isRequired,
  closeAction: PropTypes.func,
}

function NetworkList({closeAction}) {
  // TODO: get all network
  return (
    <div>
      <NetworkItem
        networkName="Conflux Tethys"
        networkType="mainnet"
        closeAction={closeAction}
        networkIcon={<TemporaryIcon className="w-7 h-7 mt-px" />}
      />
      <NetworkItem
        networkName="Conflux Tethys"
        networkType="testnet"
        closeAction={closeAction}
        networkIcon={<TemporaryIcon className="w-7 h-7 mt-px" />}
      />
      <NetworkItem
        networkName="et21231"
        networkType="custom"
        closeAction={closeAction}
        networkIcon={<TemporaryIcon className="w-7 h-7 mt-px" />}
      />
    </div>
  )
}

NetworkList.propTypes = {
  closeAction: PropTypes.func,
}

export default NetworkList
