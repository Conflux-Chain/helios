import {Trans, useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {
  CFX_ESPACE_MAINNET_CHAINID,
  ETH_MAINNET_CHAINID,
} from '@fluent-wallet/consts'

import {TitleNav, AccountDisplay} from '../../components'
import {NETWORK_TYPE} from '../../constants'
import {useCurrentAddress, useNetworkByChainId} from '../../hooks/useApi'

const FEATURE_ITEMS = [
  {
    id: 'flexible-gas',
    iconSrc: '/images/7702FlexibleGas.svg',
    titleKey: 'eip7702FlexibleGasTitle',
    descKey: 'eip7702FlexibleGasDesc',
  },
  {
    id: 'batch-transactions',
    iconSrc: '/images/7702BatchTransactions.svg',
    titleKey: 'eip7702BatchTransactionsTitle',
    descKey: 'eip7702BatchTransactionsDesc',
  },
  {
    id: 'dapp-support',
    iconSrc: '/images/7702DappSupport.svg',
    titleKey: 'eip7702DappSupportTitle',
    descKey: 'eip7702DappSupportDesc',
  },
]

function EIP7702Upgrade() {
  const {t} = useTranslation()
  const {data: currentAddress = {}} = useCurrentAddress()
  const {value: address, account: {nickname} = {}} = currentAddress
  const espaceNetworks = useNetworkByChainId(
    CFX_ESPACE_MAINNET_CHAINID,
    NETWORK_TYPE.ETH,
  )
  const ethereumNetworks = useNetworkByChainId(
    ETH_MAINNET_CHAINID,
    NETWORK_TYPE.ETH,
  )
  const [espaceNetwork = {}] = espaceNetworks
  const [ethereumNetwork = {}] = ethereumNetworks

  return (
    <div
      id="eip-7702-upgrade"
      className="bg-gray-0 pb-4 h-full w-full flex flex-col bg-top bg-no-repeat"
      style={{backgroundImage: 'url(/images/7702UpgradeBG.svg)'}}
    >
      <header>
        <TitleNav title={t('eip7702Upgrade')} />
        <div className="mt-1 px-4">
          <AccountDisplay address={address} nickname={nickname} />
        </div>
      </header>
      <main className="mt-3 p-4 rounded-lg bg-white">
        <p className="text-sm font-normal leading-[18px] text-gray-80">
          <Trans
            i18nKey="eip7702UpgradeIntro"
            components={{
              Highlight: <span className="text-primary" />,
            }}
          />
        </p>
        <section className="mt-3 space-y-3">
          {FEATURE_ITEMS.map(({id, iconSrc, titleKey, descKey}) => (
            <article
              key={id}
              className="flex items-start gap-3 rounded-lg border border-gray-10 bg-gray-4 p-3"
            >
              <img
                className="mt-px h-5 w-5 shrink-0"
                alt=""
                aria-hidden="true"
                src={iconSrc}
              />
              <div className="flex-1">
                <p className="text-sm font-medium leading-[18px] text-gray-80">
                  {t(titleKey)}
                </p>
                <p className="mt-1 text-xs font-normal leading-4 text-gray-60">
                  {t(descKey)}
                </p>
              </div>
            </article>
          ))}
        </section>

        <div>
          <p className="mt-4 text-sm font-normal text-gray-60">
            {t('eip7702SupportedNetwork')}
          </p>

          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between rounded-lg">
              <div className="flex items-center min-w-0">
                <img
                  className="w-4 h-4 mr-2 shrink-0"
                  src={espaceNetwork?.icon}
                  alt="network icon"
                />
                <span className="text-sm font-medium text-gray-80 truncate">
                  {espaceNetwork?.name}
                </span>
              </div>
              <Button>{t('enable')}</Button>
            </div>

            <div className="flex items-center justify-between rounded-lg">
              <div className="flex items-center min-w-0">
                <img
                  className="w-4 h-4 mr-2 shrink-0"
                  src={ethereumNetwork?.icon}
                  alt="network icon"
                />
                <span className="text-sm font-medium text-gray-80 truncate">
                  {ethereumNetwork?.name}
                </span>
              </div>
              <Button variant="outlined">{t('revoke')}</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default EIP7702Upgrade
