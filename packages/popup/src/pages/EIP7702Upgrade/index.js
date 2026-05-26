import {Trans, useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Button from '@fluent-wallet/component-button'
import {
  EIP7702_NETWORK_CONFIGS,
  CFX_ESPACE_MAINNET_CHAINID,
  CFX_ESPACE_TESTNET_CHAINID,
  ETH_TX_TYPES,
  NULL_HEX_ADDRESS,
} from '@fluent-wallet/consts'

import {TitleNav, AccountDisplay} from '../../components'
import {useCurrentTxStore} from '../../hooks'
import {NETWORK_TYPE, ROUTES} from '../../constants'
import {
  useCurrentAddress,
  useEip7702AccountStates,
  useNetworkByChainId,
} from '../../hooks/useApi'

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
  const history = useHistory()
  const {setPresetTx} = useCurrentTxStore()
  const {data: currentAddress = {}} = useCurrentAddress()
  const {
    value: address,
    account: {nickname, eid: accountId} = {},
    network: {isMainnet, isTestnet} = {},
  } = currentAddress

  let targetUpgradeNetworkChainId = null

  if (isMainnet) {
    targetUpgradeNetworkChainId = CFX_ESPACE_MAINNET_CHAINID
  } else if (isTestnet) {
    targetUpgradeNetworkChainId = CFX_ESPACE_TESTNET_CHAINID
  }

  const hasConfiguredUpgradeNetwork = Boolean(
    targetUpgradeNetworkChainId &&
      EIP7702_NETWORK_CONFIGS[targetUpgradeNetworkChainId],
  )
  const targetUpgradeNetworkList = useNetworkByChainId(
    hasConfiguredUpgradeNetwork ? targetUpgradeNetworkChainId : null,
    NETWORK_TYPE.ETH,
  )
  const [targetUpgradeNetwork = {}] = targetUpgradeNetworkList
  const shouldShowTargetUpgradeNetwork = Boolean(targetUpgradeNetwork?.eid)
  const {data: targetUpgradeAccountStates = []} = useEip7702AccountStates(
    accountId && shouldShowTargetUpgradeNetwork
      ? [{accountId, networkId: targetUpgradeNetwork.eid}]
      : [],
  )
  const [targetUpgradeAccountState = {}] = targetUpgradeAccountStates
  const configuredDelegateAddress =
    EIP7702_NETWORK_CONFIGS[targetUpgradeNetworkChainId]?.delegateAddress

  const targetNetworkAccountStateValue = targetUpgradeAccountState.state
  const showSwitchRequired =
    targetNetworkAccountStateValue === 'delegatedToOther'
  const canPrepareUpgradeTx = Boolean(
    address && configuredDelegateAddress && targetNetworkAccountStateValue,
  )

  let supportedNetworkButtonLabelKey = 'bind'
  let supportedNetworkButtonVariant
  let supportedNetworkButtonDisabled = false

  switch (targetNetworkAccountStateValue) {
    case 'delegatedToConfigured':
      supportedNetworkButtonLabelKey = 'revoke'
      supportedNetworkButtonVariant = 'outlined'
      break
    case 'unsupportedCode':
    case 'unsupportedNetwork':
      supportedNetworkButtonVariant = 'outlined'
      supportedNetworkButtonDisabled = true
      break
  }

  const openEip7702ConfirmPage = ({delegateAddress, action}) => {
    if (!address || !delegateAddress || !action) return

    const presetTx = {
      from: address,
      to: address,
      value: '0x0',
      type: ETH_TX_TYPES.EIP7702,
      authorizationList: [{address: delegateAddress}],
    }

    setPresetTx(presetTx, {eip7702Action: action})

    history.push({
      pathname: ROUTES.CONFIRM_TRANSACTION,
    })
  }

  const onClickSwitch = () => {
    if (targetNetworkAccountStateValue !== 'delegatedToOther') return
    openEip7702ConfirmPage({
      delegateAddress: configuredDelegateAddress,
      action: 'switch',
    })
  }

  const onClickSupportedNetworkAction = () => {
    if (targetNetworkAccountStateValue === 'delegatedToConfigured') {
      openEip7702ConfirmPage({
        delegateAddress: NULL_HEX_ADDRESS,
        action: 'revoke',
      })
      return
    }

    if (targetNetworkAccountStateValue === 'notDelegated') {
      openEip7702ConfirmPage({
        delegateAddress: configuredDelegateAddress,
        action: 'bind',
      })
    }
  }

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

        {shouldShowTargetUpgradeNetwork && showSwitchRequired && (
          <div className="mt-4">
            <p className="mt-4 text-sm font-normal text-gray-60">
              {t('eip7702SwitchRequiredTitle')}
            </p>
            <p className="mt-1 text-xs font-normal leading-4 text-gray-60">
              {t('eip7702SwitchRequiredDesc')}
            </p>
            <div className="mt-3 flex items-center justify-between rounded-lg">
              <div className="flex items-center min-w-0">
                <img
                  className="w-4 h-4 mr-2 shrink-0"
                  src={targetUpgradeNetwork?.icon}
                  alt="network icon"
                />
                <span className="text-sm font-medium text-gray-80 truncate">
                  {targetUpgradeNetwork?.name}
                </span>
              </div>
              <Button
                size="small"
                disabled={!canPrepareUpgradeTx}
                onClick={onClickSwitch}
              >
                {t('switch')}
              </Button>
            </div>
          </div>
        )}

        {shouldShowTargetUpgradeNetwork && (
          <div>
            <p className="mt-4 text-sm font-normal text-gray-60">
              {t('eip7702SupportedNetwork')}
            </p>

            <div className="mt-3">
              <div className="flex items-center justify-between rounded-lg">
                <div className="flex items-center min-w-0">
                  <img
                    className="w-4 h-4 mr-2 shrink-0"
                    src={targetUpgradeNetwork?.icon}
                    alt="network icon"
                  />
                  <span className="text-sm font-medium text-gray-80 truncate">
                    {targetUpgradeNetwork?.name}
                  </span>
                </div>
                <Button
                  size="small"
                  variant={supportedNetworkButtonVariant}
                  disabled={
                    supportedNetworkButtonDisabled ||
                    showSwitchRequired ||
                    !canPrepareUpgradeTx
                  }
                  onClick={onClickSupportedNetworkAction}
                >
                  {t(supportedNetworkButtonLabelKey)}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default EIP7702Upgrade
