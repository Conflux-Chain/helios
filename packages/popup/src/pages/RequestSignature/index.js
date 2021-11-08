import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {formatBalance} from '@fluent-wallet/data-format'
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
} from '../../hooks/useApi'
function PlaintextMessage({message}) {
  return (
    <div>
      {Object.entries(message).map(([label, value], i) => (
        <div
          className={
            typeof value !== 'object' || value === null
              ? 'pl-2 flex mt-1'
              : 'pl-2 mt-1'
          }
          key={i}
        >
          <span className="text-xs text-gray-40">{label}: </span>
          {typeof value === 'object' && value !== null ? (
            <PlaintextMessage message={value} />
          ) : (
            <span className="text-sm text-gray-80 ml-1 whitespace-pre-line break-words overflow-hidden font-medium">{`${value}`}</span>
          )}
        </div>
      ))}
    </div>
  )
}
PlaintextMessage.propTypes = {
  message: PropTypes.object.isRequired,
}

function RequestSignature() {
  const {t} = useTranslation()
  const pendingAuthReq = usePendingAuthReq()
  const [{req, app}] = pendingAuthReq?.length ? pendingAuthReq : [{}]
  const dappAccountId = app?.currentAccount?.eid
  const dappNetworkId = app?.currentNetwork?.eid
  const address = useAddressByNetworkId(dappAccountId, dappNetworkId)
  const balanceData = useBalance(address, dappNetworkId)
  const plaintextData = req?.params?.[1] ? JSON.parse(req.params[1]) : {}

  return (
    <div
      id="requestSignatureContainer"
      className="flex flex-col h-full bg-blue-circles bg-no-repeat bg-bg"
    >
      <header>
        <TitleNav title={t('signTypeMessage')} hasGoBack={false} />
        <div className="flex mt-1 px-4 pb-3 items-center justify-between">
          <AccountDisplay
            address={address}
            accountId={dappAccountId}
            nickname={app?.currentAccount?.nickname}
          />
          <div className="flex items-center justify-between">
            <DisplayBalance
              balance={formatBalance(balanceData?.[address]?.['0x0'])}
              maxWidthStyle="max-w-[148px]"
              maxWidth={148}
            />
            <span className="text-gray-60 text-xs ml-0.5">
              {app?.currentNetwork?.ticker?.name || ''}
            </span>
          </div>
        </div>
      </header>
      <div className="flex-1 flex justify-between flex-col bg-gray-0 rounded-t-xl pb-4">
        <main className="rounded-t-xl pt-4 px-3 bg-gray-0">
          <div className="ml-1">
            <div className="text-sm text-gray-80 font-medium">
              {t('signThisMessage')}
            </div>
            <div className="text-xs text-gray-40 mt-1">
              {plaintextData?.domain?.name}
            </div>
          </div>
          <CompWithLabel label={<p className="font-medium">{t('message')}</p>}>
            <div className="pl-1 pr-3 pt-3 pb-4 rounded bg-gray-4">
              <PlaintextMessage message={plaintextData?.message || {}} />
            </div>
          </CompWithLabel>
          <div className="mt-3"></div>
        </main>
        <DappFooter cancelText={t('cancel')} confirmText={t('sign')} />
      </div>
    </div>
  )
}

export default RequestSignature
