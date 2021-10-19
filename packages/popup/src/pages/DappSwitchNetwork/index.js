import {useTranslation} from 'react-i18next'
import {DappFooter, DappConnectWalletHeader} from '../../components'
import {useRPC} from '@fluent-wallet/use-rpc'
import {RPC_METHODS} from '../../constants'

const {GET_PENDING_AUTH_REQ, GET_NETWORK, WALLET_SWITCH_CONFLUX_CHAIN} =
  RPC_METHODS

function DappSwitchNetwork() {
  const {t} = useTranslation()
  const {data: pendingAuthReq} = useRPC([GET_PENDING_AUTH_REQ], undefined, {
    fallbackData: [{req: null}],
  })
  const [{req}] = pendingAuthReq.length ? pendingAuthReq : [{}]
  const {data: networkData} = useRPC(
    req?.params[0]?.chainId ? [GET_NETWORK, req.params[0].chainId] : null,
    {
      chainId: req?.params[0]?.chainId,
      type: req?.method === WALLET_SWITCH_CONFLUX_CHAIN ? 'cfx' : 'eth',
    },
    {fallbackData: [{}]},
  )
  const [{isTestnet, name, endpoint, icon}] = networkData

  return (
    <div
      className="flex flex-col h-full justify-between bg-blue-circles bg-no-repeat pb-4"
      id="dappSwitchNetworkContainer"
    >
      <div>
        <DappConnectWalletHeader title={t('switchNetwork')} />
        <main className="mt-3 px-3">
          <div className="ml-1">
            <div>
              <div className="text-sm text-gray-80 font-medium">
                {t('allowAddNetwork')}
              </div>
              <div className="text-xs mt-1 text-gray-40">
                {t('warningAddNetwork')}
              </div>
            </div>
          </div>
          <div className="mt-4 relative h-15 ">
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
                <div className="text-center text-xs text-[#F5B797] bg-[#FFF7F4] w-14 h-5 absolute top-px right-px rounded-tr rounded-bl-2 rounded-bl-lg">
                  testnet
                </div>
              ) : null}
            </div>
          </div>
          <div className="px-3 py-4 bg-gray-4">
            <div>
              <div className="text-xs text-gray-40">{t('networkUrl')}</div>
              <div className="text-sm text-gray-80 font-medium mt-0.5 whitespace-nowrap overflow-hidden overflow-ellipsis">
                {endpoint}
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-40">{t('chainId')}</div>
              <div className="text-sm text-gray-80 font-medium mt-0.5">
                {req?.params?.[0]?.chainId || ''}
              </div>
            </div>
          </div>
        </main>
      </div>
      <DappFooter cancelText={t('cancel')} confirmText={t('switch')} />
    </div>
  )
}

export default DappSwitchNetwork
