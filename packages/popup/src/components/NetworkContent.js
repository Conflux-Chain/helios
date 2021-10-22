import PropTypes from 'prop-types'
import {useRPC} from '@fluent-wallet/use-rpc'
import {RPC_METHODS} from '../constants'
import {request} from '../utils'
import {useSWRConfig} from 'swr'
import {CustomTag} from './'

const {GET_NETWORK, SET_CURRENT_NETWORK, GET_CURRENT_NETWORK} = RPC_METHODS
const networkTypeColorObj = {
  mainnet: 'bg-primary-10 text-[#ACB6E0]',
  testnet: 'bg-[#FFF7F4] text-[#F5B797]',
  custom: 'bg-[#F0FDFC] text-[#83DBC6]',
}
const itemWrapperPaddingStyleObj = {
  small: 'pl-3',
  medium: 'pl-3.5',
}
function NetworkItem({
  networkName,
  networkType,
  icon,
  onClickNetworkItem,
  networkId,
  networkItemSize = 'medium',
  ...props
}) {
  const {mutate} = useSWRConfig()
  const networkTypeColor = networkTypeColorObj[networkType] || ''
  const itemWrapperPaddingStyle =
    itemWrapperPaddingStyleObj[networkItemSize] || ''

  const onChangeNetwork = () => {
    request(SET_CURRENT_NETWORK, [networkId]).then(({result}) => {
      mutate([GET_CURRENT_NETWORK])
      onClickNetworkItem(result, {networkId, networkName, icon})
      // TODO: need deal with error condition
    })
  }

  return (
    <div
      {...props}
      aria-hidden="true"
      className={`bg-gray-0 mt-4 h-15 flex items-center rounded relative cursor-pointer ${itemWrapperPaddingStyle}`}
      onClick={onChangeNetwork}
    >
      <div className="w-8 h-8 border border-solid border-gray-20 rounded-full flex items-center justify-center">
        <img
          alt="network-icon"
          className="w-7 h-7"
          src={icon || 'images/default-network-icon.svg'}
        />
      </div>
      <div className="ml-2.5 text-gray-80 text-sm font-medium">
        {networkName}
      </div>
      <CustomTag className={`absolute right-0 top-0 ${networkTypeColor}`}>
        {networkType}
      </CustomTag>
    </div>
  )
}
NetworkItem.propTypes = {
  networkName: PropTypes.string.isRequired,
  networkType: PropTypes.oneOf(['mainnet', 'testnet', 'custom']).isRequired,
  networkItemSize: PropTypes.oneOf(['small', 'medium']),
  networkId: PropTypes.number.isRequired,
  icon: PropTypes.string,
  onClickNetworkItem: PropTypes.func.isRequired,
}

function NetworkContent({onClickNetworkItem, networkItemSize}) {
  const {data: networkData} = useRPC(
    [GET_NETWORK],
    {},
    {
      fallbackData: [],
    },
  )
  console.log('networkData', networkData)
  return (
    <>
      {networkData.map(({eid, name, isCustom, isMainnet, isTestnet, icon}) => (
        <NetworkItem
          key={eid}
          networkId={eid}
          networkName={name}
          networkItemSize={networkItemSize}
          networkType={
            isCustom
              ? 'custom'
              : isMainnet
              ? 'mainnet'
              : isTestnet
              ? 'testnet'
              : ''
          }
          onClickNetworkItem={onClickNetworkItem}
          icon={icon}
          id={`item-${eid}`}
        />
      ))}
    </>
  )
}

NetworkContent.propTypes = {
  onClickNetworkItem: PropTypes.func.isRequired,
  networkItemSize: PropTypes.oneOf(['small', 'medium']),
}

export default NetworkContent
