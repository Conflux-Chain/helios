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
import {useCallback, useMemo, useState} from 'react'
import {TypedDataSign} from './components/TypedDataSign'
import {PersonalSign} from './components/PersonalSign'
import {SignInSign} from './components/SignInSign'
import Alert from '@fluent-wallet/component-alert'
import {detectSIWEMessage} from '@fluent-wallet/utils'
import {WarningFilled} from '@fluent-wallet/component-icons'
import {useSIWEValidation} from '../../hooks/useSIWEValidation'
import Button from '@fluent-wallet/component-button'
import SIWERiskModal from './components/SIWERiskModal'

const {PERSONAL_SIGN, ACCOUNT_GROUP_TYPE} = RPC_METHODS

function RequestSignature() {
  const {t} = useTranslation()
  const pendingAuthReq = usePendingAuthReq()
  const [{req, app}] = pendingAuthReq?.length ? pendingAuthReq : [{}]

  const isPersonalSign = req?.method === PERSONAL_SIGN
  const dappAccountId = app?.currentAccount?.eid
  const dappNetworkId = app?.currentNetwork?.eid
  const origin = app?.site?.origin

  const plaintextData = useMemo(
    () =>
      !isPersonalSign && req?.params?.[1] ? JSON.parse(req.params[1]) : {},
    [isPersonalSign, req?.params],
  )
  const personalSignData = useMemo(
    () => (isPersonalSign ? req?.params?.[0] ?? '' : ''),
    [isPersonalSign, req?.params],
  )

  const {isSIWEMessage, parsedMessage} = useMemo(
    () => detectSIWEMessage(personalSignData),
    [personalSignData],
  )
  const [riskModalState, setRiskModalState] = useState({
    open: false,
  })

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

  const [siweErrors] = useSIWEValidation({
    parsedMessage,
    origin: origin,
    address,
  })

  const signTitle = useMemo(() => {
    if (!isPersonalSign) return t('signTypeMessage')
    return isSIWEMessage ? t('signWithEthereumTitle') : t('signText')
  }, [isPersonalSign, isSIWEMessage, t])

  const SignatureContent = useMemo(() => {
    if (isPersonalSign) {
      if (!isSIWEMessage)
        return <PersonalSign personalSignData={personalSignData} />

      return (
        <SignInSign
          parsedMessage={parsedMessage}
          currentNetwork={app?.currentNetwork}
          errors={siweErrors}
        />
      )
    }
    return <TypedDataSign plaintextData={plaintextData} />
  }, [
    isPersonalSign,
    isSIWEMessage,
    parsedMessage,
    plaintextData,
    personalSignData,
    app?.currentNetwork,
    siweErrors,
  ])

  const currentUrlError = siweErrors?.uri

  const needsUserConfirmationError =
    siweErrors &&
    Object.keys(siweErrors).find(
      key => siweErrors[key]?.needConfirm && !siweErrors[key]?.isUserConfirmed,
    )

  const handleRiskReview = useCallback(() => {
    if (
      needsUserConfirmationError &&
      siweErrors?.[needsUserConfirmationError]?.isUserConfirmed === false
    ) {
      setRiskModalState({open: true})
    }
  }, [needsUserConfirmationError, siweErrors])

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
        <main className="rounded-t-xl px-3 bg-gray-0">
          {SignatureContent}
          {isHw && (
            <Alert
              open={true}
              className="mt-3"
              type="warning"
              closable={false}
              width="w-full"
              content={t('disableUnsupportedSign')}
              id="disableSignAlert"
            />
          )}

          {!isHw && siweErrors && Object.keys(siweErrors).length > 0 && (
            <Alert
              open={true}
              type="warning"
              icon={<WarningFilled />}
              closable={false}
              content={<span className="ml-1 text-xs">{t('siweAlert')}</span>}
              className="mb-2 w-auto"
              id="siweAlert"
            />
          )}
        </main>
        <div>
          <DappFooter
            cancelText={t('cancel')}
            confirmText={
              needsUserConfirmationError ? t('siweReviewAlert') : t('sign')
            }
            confirmDisabled={isHw}
            confirmComponent={
              needsUserConfirmationError
                ? () => (
                    <Button
                      id="confirmBtn"
                      className="flex-1 !bg-error"
                      onClick={handleRiskReview}
                    >
                      {t('siweReviewAlert')}
                    </Button>
                  )
                : null
            }
          />

          <SIWERiskModal
            open={riskModalState.open}
            onClose={() => setRiskModalState({open: false})}
            title={currentUrlError?.title}
            content={currentUrlError?.content}
            knownRisk={currentUrlError?.knownRisk}
            onConfirmationToggle={currentUrlError?.onConfirmationToggle}
            isUserConfirmed={currentUrlError?.isUserConfirmed}
          />
        </div>
      </div>
    </div>
  )
}

export default RequestSignature
