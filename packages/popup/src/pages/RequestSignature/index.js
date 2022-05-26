import {useTranslation} from 'react-i18next'
import {isUndefined} from '@fluent-wallet/checks'
import Alert from '@fluent-wallet/component-alert'
import {
  DappFooter,
  CompWithLabel,
  TitleNav,
  AccountDisplay,
  DisplayBalance,
} from '../../components'
import {
  usePendingAuthReq,
  useBalance,
  useAddressByNetworkId,
  useCurrentTicker,
  useAddress,
} from '../../hooks/useApi'
import PlaintextMessage from './components/PlaintextMessage'
import {RPC_METHODS} from '../../constants'
const {PERSONAL_SIGN, ACCOUNT_GROUP_TYPE} = RPC_METHODS

function RequestSignature() {
  const {t} = useTranslation()
  const pendingAuthReq = usePendingAuthReq()
  const [{req, app}] = pendingAuthReq?.length ? pendingAuthReq : [{}]
  const isPersonalSign = req?.method === PERSONAL_SIGN
  const dappAccountId = app?.currentAccount?.eid
  const dappNetworkId = app?.currentNetwork?.eid
  const {decimals} = useCurrentTicker()
  const {value: address} = useAddressByNetworkId(dappAccountId, dappNetworkId)
  const balanceData = useBalance(address, dappNetworkId)
  const {data: AddressData} = useAddress({
    stop: isUndefined(dappAccountId) || isUndefined(dappNetworkId),
    accountId: dappAccountId,
    networkId: dappNetworkId,
  })

  const isHw =
    AddressData?.account?.accountGroup?.vault?.type === ACCOUNT_GROUP_TYPE.HW

  const plaintextData =
    !isPersonalSign && req?.params?.[1] ? JSON.parse(req.params[1]) : {}
  const personalSignData = isPersonalSign ? req?.params?.[0] ?? '' : ''

  return (
    <div
      id="requestSignatureContainer"
      className="flex flex-col h-full w-full bg-blue-circles bg-no-repeat bg-bg"
    >
      <header id="header">
        <TitleNav
          title={isPersonalSign ? t('signText') : t('signTypeMessage')}
          hasGoBack={false}
        />
        <div className="flex mt-1 px-4 pb-3 items-center justify-between">
          <AccountDisplay
            address={address}
            accountId={dappAccountId}
            nickname={app?.currentAccount?.nickname}
          />
          <div className="flex items-center justify-between">
            <DisplayBalance
              balance={balanceData?.[address]?.['0x0'] || '0x0'}
              maxWidthStyle="max-w-[140px]"
              maxWidth={140}
              decimals={decimals}
            />
            <span className="text-gray-60 text-xs ml-0.5">
              {app?.currentNetwork?.ticker?.symbol || ''}
            </span>
          </div>
        </div>
      </header>
      <div className="flex-1 flex justify-between flex-col bg-gray-0 rounded-t-xl pb-4">
        <main className="rounded-t-xl pt-4 px-3 bg-gray-0">
          {!isPersonalSign ? (
            <div className="ml-1" id="signTypeMsgDes">
              <div className="text-sm text-gray-80 font-medium">
                {t('signThisMessage')}
              </div>
              <div className="text-xs text-gray-40 mt-1">
                {plaintextData?.domain?.name}
              </div>
            </div>
          ) : null}
          <CompWithLabel
            label={
              <p id="labelDes" className="font-medium">
                {isPersonalSign ? t('signThisText') : t('message')}
              </p>
            }
          >
            <div
              id="plaintext"
              className={`${
                isPersonalSign ? 'pl-3 max-h-[316px]' : 'pl-1 max-h-[282px]'
              } pr-3 pt-3 pb-4 rounded bg-gray-4 overflow-auto break-words`}
            >
              {isPersonalSign ? (
                personalSignData
                  .replace(/\r/g, '\n')
                  .split('\n')
                  .map(str => (
                    <div key={str} className={str ? '' : 'h-[18px]'}>
                      {str}
                    </div>
                  ))
              ) : (
                <PlaintextMessage message={plaintextData?.message ?? {}} />
              )}
            </div>
          </CompWithLabel>
          <Alert
            open={isHw}
            className="mt-3"
            type="warning"
            closable={false}
            width="w-full"
            content={t(
              isPersonalSign ? 'disablePersonSign' : 'disableTypeSign',
            )}
          />
        </main>
        <DappFooter
          cancelText={t('cancel')}
          confirmText={t('sign')}
          confirmDisabled={isHw}
        />
      </div>
    </div>
  )
}

export default RequestSignature
