import PropTypes from 'prop-types'
import {useRPC} from '@fluent-wallet/use-rpc'
import {RPC_METHODS} from '../../../constants'
import {request} from '../../../utils'
import {useSWRConfig} from 'swr'
import {SlideCard} from '../../../components'
import {CurrentAccountNetworkLabel} from './index'
const {GET_NETWORK, SET_CURRENT_NETWORK, GET_CURRENT_NETWORK} = RPC_METHODS

const networkTypeColorObj = {
  mainnet: 'bg-primary-10 text-[#ACB6E0]',
  testnet: 'bg-[#FFF7F4] text-[#F5B797]',
  custom: 'bg-[#F0FDFC] text-[#83DBC6]',
}

function NetworkItem({
  networkName,
  networkType,
  networkIcon,
  closeAction,
  networkId,
}) {
  const {mutate} = useSWRConfig()
  const networkTypeColor = networkTypeColorObj[networkType] || ''
  const onChangeNetwork = () => {
    request(SET_CURRENT_NETWORK, [networkId]).then(({result}) => {
      result && closeAction && closeAction()
      mutate([GET_CURRENT_NETWORK])
      // TODO: need deal with error condition
    })
  }

  return (
    <div
      aria-hidden="true"
      className="bg-gray-0 mt-4 h-15 flex items-center pl-3.5 rounded relative cursor-pointer"
      onClick={onChangeNetwork}
    >
      <div className="w-8 h-8 border border-solid border-gray-20 rounded-full flex items-center justify-center">
        {networkIcon}
      </div>
      <div className="ml-2.5 text-gray-80 text-sm font-medium">
        {networkName}
      </div>
      <div
        className={`text-xs py-0.5 w-14 text-center rounded-tr absolute right-0 top-0 rounded-bl-lg ${networkTypeColor}`}
      >
        {networkType}
      </div>
    </div>
  )
}
NetworkItem.propTypes = {
  networkName: PropTypes.string.isRequired,
  networkType: PropTypes.oneOf(['mainnet', 'testnet', 'custom']).isRequired,
  networkId: PropTypes.number.isRequired,
  networkIcon: PropTypes.element.isRequired,
  closeAction: PropTypes.func,
}

function NetworkList({cardTitle, onClose, showSlideCard}) {
  const {data: networkData} = useRPC(
    [GET_NETWORK],
    {},
    {
      fallbackData: [],
    },
  )
  return (
    <SlideCard
      cardTitle={cardTitle}
      onClose={onClose}
      showSlideCard={showSlideCard}
      cardDescription={<CurrentAccountNetworkLabel />}
      cardContent={networkData.map(
        ({eid, name, isCustom, isMainnet, isTestnet, icon}) => (
          <NetworkItem
            key={eid}
            networkId={eid}
            networkName={name}
            networkType={
              isCustom
                ? 'custom'
                : isMainnet
                ? 'mainnet'
                : isTestnet
                ? 'testnet'
                : ''
            }
            closeAction={onClose}
            networkIcon={
              <img
                alt="network-icon"
                className="w-7 h-7"
                src={icon || 'images/default-network-icon.svg'}
              />
            }
          />
        ),
      )}
    />
  )
}

NetworkList.propTypes = {
  cardTitle: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  showSlideCard: PropTypes.bool,
}

export default NetworkList
