import PropTypes from 'prop-types'
import Message from '@fluent-wallet/component-message'
import {CheckCircleFilled} from '@fluent-wallet/component-icons'
import {RPC_METHODS} from '../constants'
import {request, setEffectiveCurrentAccount} from '../utils'
import {useNetwork, useCurrentAddress} from '../hooks/useApi'
import useLoading from '../hooks/useLoading'
import {CustomTag} from './'
import {useTranslation} from 'react-i18next'

const {WALLET_SET_CURRENT_NETWORK, ACCOUNT_GROUP_TYPE} = RPC_METHODS
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
  type,
  networkName,
  networkType,
  rpcUrl,
  chainId,
  symbol,
  blockExplorerUrl = '',
  icon,
  onClickNetworkItem,
  networkId,
  networkItemSize = 'medium',
  onClose,
  showCurrentIcon = true,
  needSwitchNet = true,
  index,
  ...props
}) {
  const {setLoading} = useLoading()
  const {t} = useTranslation()
  const {
    mutate: mutateCurrentAddress,
    data: {
      network: {eid: currentNetworkId, type: currentNetworkType},
      account: currentAccount,
    },
  } = useCurrentAddress()

  const networkTypeColor = networkTypeColorObj[networkType] || ''
  const itemWrapperPaddingStyle =
    itemWrapperPaddingStyleObj[networkItemSize] || ''
  const isHw =
    currentAccount.accountGroup?.vault?.type === ACCOUNT_GROUP_TYPE.HW

  const onChangeNetwork = async () => {
    if (isHw && currentNetworkType !== type) {
      await setEffectiveCurrentAccount(networkId)
    }

    await request(WALLET_SET_CURRENT_NETWORK, [networkId])
    await mutateCurrentAddress()
  }

  const onClickNetwork = () => {
    const netData = {
      type,
      networkId,
      networkName,
      icon,
      rpcUrl,
      chainId,
      symbol,
      blockExplorerUrl,
      networkType,
    }
    if (!needSwitchNet) {
      onClose?.()
      return onClickNetworkItem?.({...netData})
    }

    if (currentNetworkId === networkId) {
      return onClose?.()
    }

    if (!Object.keys(currentAccount).length) {
      return
    }
    setLoading(true)

    onChangeNetwork()
      .then(() => {
        onClickNetworkItem?.({...netData})
        onClose?.()
      })
      .catch(error => {
        Message.error({
          content: error?.message || t('changeNetworkError'),
          top: '110px',
          duration: 1,
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <div
      {...props}
      aria-hidden="true"
      className={`bg-gray-0 ${
        index !== 0 ? 'mt-4' : ''
      } h-15 flex items-center rounded relative hover:bg-primary-10 ${
        currentNetworkId === networkId && needSwitchNet
          ? 'cursor-default'
          : 'cursor-pointer'
      } ${itemWrapperPaddingStyle} pr-3.5`}
      onClick={onClickNetwork}
    >
      <div className="w-8 h-8 border border-solid border-gray-20 rounded-full flex items-center justify-center">
        <img
          alt="network-icon"
          className="w-7 h-7"
          src={icon || '/images/default-network-icon.svg'}
        />
      </div>
      <div className="ml-2.5 flex-1 text-gray-80 text-sm font-medium">
        {networkName}
      </div>
      {currentNetworkId === networkId && showCurrentIcon && (
        <CheckCircleFilled className="w-4 h-4 text-success" />
      )}
      <CustomTag
        className={`absolute right-0 top-0 ${networkTypeColor} px-2`}
        width="w-auto"
      >
        {t(networkType)}
      </CustomTag>
    </div>
  )
}
NetworkItem.propTypes = {
  networkName: PropTypes.string.isRequired,
  rpcUrl: PropTypes.string.isRequired,
  chainId: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  symbol: PropTypes.string.isRequired,
  blockExplorerUrl: PropTypes.string,
  networkType: PropTypes.oneOf(['mainnet', 'testnet', 'custom']).isRequired,
  networkItemSize: PropTypes.oneOf(['small', 'medium']),
  networkId: PropTypes.number.isRequired,
  icon: PropTypes.string,
  onClickNetworkItem: PropTypes.func,
  onClose: PropTypes.func,
  showCurrentIcon: PropTypes.bool,
  needSwitchNet: PropTypes.bool,
  index: PropTypes.number.isRequired,
}

function NetworkContent({
  onClickNetworkItem,
  networkItemSize,
  onClose,
  ...props
}) {
  const networkData = useNetwork()

  return (
    <>
      {networkData.map(
        (
          {
            eid,
            name,
            isCustom,
            isMainnet,
            isTestnet,
            icon,
            endpoint,
            chainId,
            ticker,
            scanUrl,
            type,
          },
          index,
        ) => (
          <NetworkItem
            key={eid}
            index={index}
            networkId={eid}
            networkName={name}
            networkItemSize={networkItemSize}
            type={type}
            networkType={
              isCustom
                ? 'custom'
                : isMainnet
                ? 'mainnet'
                : isTestnet
                ? 'testnet'
                : ''
            }
            rpcUrl={endpoint}
            chainId={chainId}
            symbol={ticker.symbol}
            blockExplorerUrl={scanUrl}
            onClickNetworkItem={onClickNetworkItem}
            onClose={onClose}
            icon={icon}
            id={`item-${eid}`}
            {...props}
          />
        ),
      )}
    </>
  )
}

NetworkContent.propTypes = {
  onClickNetworkItem: PropTypes.func,
  onClose: PropTypes.func,
  networkItemSize: PropTypes.oneOf(['small', 'medium']),
}

export default NetworkContent
