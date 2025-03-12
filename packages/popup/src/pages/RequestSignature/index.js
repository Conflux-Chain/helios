import {useTranslation} from 'react-i18next'
import {isUndefined} from '@fluent-wallet/checks'

import {
  DappFooter,
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

import {RPC_METHODS} from '../../constants'
import {useMemo} from 'react'
import {TypedDataSign} from './components/TypedDataSign'
import {PersonalSign} from './components/PersonalSign'
import {SignInSign} from './components/SignInSign'
import Alert from '@fluent-wallet/component-alert'
import {detectSIWEMessage} from '@fluent-wallet/utils'
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

  const plaintextData = useMemo(
    () =>
      !isPersonalSign && req?.params?.[1] ? JSON.parse(req.params[1]) : {},
    [isPersonalSign, req?.params],
  )
  const personalSignData = isPersonalSign ? req?.params?.[0] ?? '' : ''

  const {isSIWEMessage, parsedMessage} = detectSIWEMessage(personalSignData)

  const MessageContent = useMemo(() => {
    if (isPersonalSign) {
      if (!isSIWEMessage)
        return <PersonalSign personalSignData={personalSignData} />

      return (
        <SignInSign
          parsedMessage={parsedMessage}
          currentNetwork={app?.currentNetwork}
        />
      )
    }

    return <TypedDataSign plaintextData={plaintextData} />
  }, [
    isPersonalSign,
    isSIWEMessage,
    parsedMessage,
    plaintextData,
    app?.currentNetwork,
    personalSignData,
  ])

  const signTitle = useMemo(() => {
    if (isPersonalSign) {
      if (isSIWEMessage) {
        return t('signWithEthereumTitle')
      }

      return t('signText')
    }

    return t('signTypeMessage')
  }, [isPersonalSign, isSIWEMessage, t])

  return (
    <div
      id="requestSignatureContainer"
      className="flex flex-col h-full w-full bg-blue-circles bg-no-repeat bg-bg"
    >
      <header id="header">
        <TitleNav title={signTitle} hasGoBack={false} />
        <div className="flex mt-1 px-4 pb-3 items-center justify-between">
          <AccountDisplay
            address={address}
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
          {MessageContent}
          <Alert
            open={isHw}
            className="mt-3"
            type="warning"
            closable={false}
            width="w-full"
            content={t('disablePersonSign')}
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
