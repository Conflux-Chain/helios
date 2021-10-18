import {useTranslation} from 'react-i18next'
import {useRPC} from '@fluent-wallet/use-rpc'
import {formatHexBalance} from '../../utils'
import {
  DappFooter,
  CompWithLabel,
  TitleNav,
  CurrentAccountDisplay,
  DisplayBalance,
} from '../../components'
import {useCurrentAccount} from '../../hooks'
import {RPC_METHODS} from '../../constants'
const {GET_BALANCE} = RPC_METHODS

function RequestSignature() {
  const {t} = useTranslation()
  const {address, ticker, networkId} = useCurrentAccount()
  const {data: balanceData} = useRPC(
    address && networkId ? [GET_BALANCE, address, networkId] : null,
    {
      users: [address],
      tokens: ['0x0'],
    },
    {fallbackData: {}},
  )

  return (
    <div
      id="requestSignatureContainer"
      className="flex flex-col h-full bg-blue-circles bg-no-repeat bg-bg"
    >
      <header>
        <TitleNav title={t('signTypeMessage')} hasGoBack={false} />
        <div className="flex mt-1 px-4 pb-3 items-center justify-between">
          <CurrentAccountDisplay />
          <div className="flex items-center justify-between">
            <DisplayBalance
              balance={formatHexBalance(balanceData?.[address]?.['0x0'])}
              maxWidthStyle="max-w-[148px]"
              maxWidth={148}
            />
            <span className="text-gray-60 text-xs ml-0.5">
              {ticker?.name || ''}
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
            <div className="text-xs text-gray-40 mt-1">Dai Stablecoin</div>
          </div>
          <CompWithLabel label={<p className="font-medium">{t('message')}</p>}>
            <div className="px-3 py-4 rounded bg-gray-4">
              <div className="text-xs text-gray-40">{t('holder')}</div>
              <div className="break-words text-gray-80 mt-0.5">
                0xE592427A0AEce92De3Edee1F18E0157C058615641231231231312
              </div>
              <div className="text-xs text-gray-40 mt-3">{t('spender')}</div>
              <div className="break-words text-gray-80 mt-0.5">
                0xE592427A0AEce92De3Edee1F18E0157C058615641231231231312
              </div>
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
