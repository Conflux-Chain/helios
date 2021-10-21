import {useTranslation} from 'react-i18next'
import {formatHexBalance} from '../../utils'
import {usePendingAuthReq, useDappAuthorizedAccountBalance} from '../../hooks'
import {TitleNav, AccountDisplay, DappFooter, TokenItem} from '../../components'

function ConfirmAddSuggestedToken() {
  const {t} = useTranslation()
  const {pendingAuthReq} = usePendingAuthReq()
  const [{req, app}] = pendingAuthReq?.length ? pendingAuthReq : [{}]
  const dappAccountId = app?.currentAccount?.eid
  const dappNetworkId = app?.currentNetwork?.eid
  const {data: balanceData} = useDappAuthorizedAccountBalance(
    dappAccountId,
    dappNetworkId,
    req?.params?.options?.address,
  )
  const address = Object.keys(balanceData)[0]
  console.log('pendingAuthReq', balanceData)

  return (
    <div
      id="confirmAddSuggestedTokenContainer"
      className="flex flex-col h-full bg-blue-circles bg-no-repeat bg-bg"
    >
      <header>
        <TitleNav title={t('addSuggestedToken')} hasGoBack={false} />
        <div className="mt-1 px-4 pb-3">
          <AccountDisplay
            address={address}
            accountId={dappAccountId}
            nickname={app?.currentAccount?.nickname}
          />
        </div>
      </header>
      <div className="flex-1 flex justify-between flex-col bg-gray-0 rounded-t-xl pb-4">
        <main className=" pt-4 px-3 ">
          <p className="text-sm text-gray-80 font-medium pb-2 ml-1">
            {t('confirmAddSuggestedToken')}
          </p>
          <div className="px-3 bg-bg rounded">
            <TokenItem
              token={{
                icon:
                  req?.params?.options?.image || '/images/default-token-icon',
                symbol: req?.params?.options?.symbol || '',
                name: req?.params?.options?.symbol || '',
              }}
              maxWidthStyle="max-w-[184px]"
              maxWidth={184}
              balance={formatHexBalance(
                balanceData?.[address]?.[req?.params?.options?.address],
              )}
            />
          </div>
        </main>
        <DappFooter cancelText={t('cancel')} confirmText={t('addToken')} />
      </div>
    </div>
  )
}

export default ConfirmAddSuggestedToken
