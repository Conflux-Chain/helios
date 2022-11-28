import {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {formatHexToDecimal} from '@fluent-wallet/data-format'
import {DappFooter, DappProgressHeader, CustomTag} from '../../components'
import {RPC_METHODS, NETWORK_TYPE} from '../../constants'
import {getInnerUrlWithoutLimitKey} from '../../utils'
import {usePendingAuthReq, useNetworkByChainId} from '../../hooks/useApi'
const {WALLET_SWITCH_CONFLUX_CHAIN} = RPC_METHODS

function DappSwitchNetwork() {
  const {t} = useTranslation()
  const pendingAuthReq = usePendingAuthReq()
  const [{req}] = pendingAuthReq?.length ? pendingAuthReq : [{}]
  const networkData = useNetworkByChainId(
    req?.params[0]?.chainId,
    req?.method === WALLET_SWITCH_CONFLUX_CHAIN
      ? NETWORK_TYPE.CFX
      : NETWORK_TYPE.ETH,
  )
  const [{isTestnet, name, endpoint, icon}] = networkData.length
    ? networkData
    : [{}]

  const disPlayRpcURL = useMemo(() => {
    return getInnerUrlWithoutLimitKey(name) || endpoint
  }, [name, endpoint])

  return (
    <div
      className="flex flex-col h-full w-full justify-between bg-blue-circles bg-no-repeat pb-4"
      id="dappSwitchNetworkContainer"
    >
      <div>
        <DappProgressHeader title={t('switchNetwork')} />
        <main className="mt-3 px-3">
          <div className="ml-1" id="des">
            <div>
              <div className="text-sm text-gray-80 font-medium">
                {t('allowSwitchNetwork')}
              </div>
              <div className="text-xs mt-1 text-gray-40">
                {t('warningAddNetwork')}
              </div>
            </div>
          </div>
          <div className="mt-4 relative h-15">
            <img
              src="/images/switch-network-bg.svg"
              alt="bg"
              className="absolute h-full z-0"
            />
            <div className="z-10 relative w-full h-full items-center justify-center flex">
              <div className="mr-2 h-8 w-8 border border-solid rounded-full border-gray-20 flex items-center justify-center">
                <img
                  src={icon || '/images/default-network-icon.svg'}
                  alt="favicon"
                  className="h-6 w-6"
                />
              </div>
              <div className="text-base text-primary font-medium">{name}</div>
              {isTestnet ? (
                <CustomTag
                  backgroundColor="bg-[#FFF7F4]"
                  className="absolute top-px right-px text-[#F5B797] px-2"
                  width="w-auto"
                >
                  {t('testnet')}
                </CustomTag>
              ) : null}
            </div>
          </div>
          <div className="px-3 py-4 bg-gray-4" id="networkContent">
            <div id="networkUrl">
              <div className="text-xs text-gray-40">{t('networkUrl')}</div>
              <div className="text-sm text-gray-80 font-medium mt-0.5 text-ellipsis">
                {disPlayRpcURL}
              </div>
            </div>
            <div className="mt-3" id="chainId">
              <div className="text-xs text-gray-40">{t('chainId')}</div>
              <div className="text-sm text-gray-80 font-medium mt-0.5">
                {formatHexToDecimal(req?.params?.[0]?.chainId || '')}
              </div>
            </div>
          </div>
        </main>
      </div>
      <DappFooter
        cancelText={t('cancel')}
        confirmText={t('switch')}
        targetNetwork={networkData?.[0]}
      />
    </div>
  )
}

export default DappSwitchNetwork
