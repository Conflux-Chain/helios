import {useTranslation} from 'react-i18next'
import {formatBalance, CFX_DECIMALS} from '@fluent-wallet/data-format'

import {
  usePendingAuthReq,
  useBalance,
  useAddressByNetworkId,
} from '../../hooks/useApi'
import {TitleNav, AccountDisplay, DappFooter, TokenItem} from '../../components'
import {RPC_METHODS} from '../../constants'
import {useSWRConfig} from 'swr'
const {WALLETDB_HOME_PAGE_ASSETS, WALLETDB_REFETCH_BALANCE} = RPC_METHODS

function ConfirmAddSuggestedToken() {
  const {mutate} = useSWRConfig()
  const {t} = useTranslation()
  const pendingAuthReq = usePendingAuthReq()
  const [{req, app}] = pendingAuthReq?.length ? pendingAuthReq : [{}]
  const dappAccountId = app?.currentAccount?.eid
  const dappNetworkId = app?.currentNetwork?.eid
  const {address} = useAddressByNetworkId(dappAccountId, dappNetworkId)
  const balanceData = useBalance(
    address,
    dappNetworkId,
    req?.params?.options?.address,
  )
  const onClickConfirm = () => {
    mutate([WALLETDB_HOME_PAGE_ASSETS])
    mutate([WALLETDB_REFETCH_BALANCE])
  }

  return (
    <div
      id="confirmAddSuggestedTokenContainer"
      className="flex flex-col h-full bg-blue-circles bg-no-repeat bg-bg"
    >
      <header id="header">
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
          <div className="px-3 bg-bg rounded" id="tokens">
            <TokenItem
              token={{
                logoURI:
                  req?.params?.options?.image || '/images/default-token-icon',
                symbol: req?.params?.options?.symbol || '',
                name: req?.params?.options?.name || '',
                balance: formatBalance(
                  balanceData?.[address]?.[req?.params?.options?.address],
                  req?.params?.options?.decimals || CFX_DECIMALS,
                ),
              }}
              maxWidthStyle="max-w-[184px]"
              maxWidth={184}
            />
          </div>
        </main>
        <DappFooter
          cancelText={t('cancel')}
          confirmText={t('addToken')}
          onClickConfirm={onClickConfirm}
        />
      </div>
    </div>
  )
}

export default ConfirmAddSuggestedToken
