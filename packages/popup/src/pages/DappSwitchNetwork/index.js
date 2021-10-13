import {useTranslation} from 'react-i18next'
import {DappTransactionFooter, DappConnectWalletHeader} from '../../components'

function DappSwitchNetwork() {
  const {t} = useTranslation()

  return (
    <div
      className="flex flex-col h-full justify-between bg-blue-circles bg-no-repeat"
      id="dappSwitchNetworkContainer"
    >
      <div>
        <header>
          <div>
            <p className="text-sm text-gray-100 text-center h-13 flex justify-center items-center mb-1">
              {t('switchNetwork')}
            </p>
            <DappConnectWalletHeader />
            <p className="text-base text-gray-80 text-center mt-2 font-medium">
              dapp name
            </p>
          </div>
        </header>
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
                  src="/images/default-network-icon.svg"
                  alt="favicon"
                  className="h-6 w-6"
                />
              </div>
              <div className="text-base text-primary font-medium">
                Binance Smart Chain
              </div>
              <div className="text-center text-xs text-[#F5B797] bg-[#FFF7F4] w-14 h-5 absolute top-px right-px rounded-tr rounded-bl-2 rounded-bl-lg">
                testnet
              </div>
            </div>
          </div>
          <div className="px-3 py-4 bg-gray-4">
            <div>
              <div className="text-xs text-gray-40">{t('NetworkUrl')}</div>
              <div className="text-sm text-gray-80 font-medium mt-0.5">
                mock url
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-40">{t('NetworkUrl')}</div>
              <div className="text-sm text-gray-80 font-medium mt-0.5">
                mock id
              </div>
            </div>
          </div>
        </main>
      </div>
      <DappTransactionFooter
        cancelText={t('cancel')}
        confirmText={t('switch')}
      />
    </div>
  )
}

export default DappSwitchNetwork
