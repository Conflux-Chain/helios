import PropTypes from 'prop-types'
import {useRef, useState} from 'react'
import {Redirect} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import Message from '@fluent-wallet/component-message'
import {useSWRConfig} from 'swr'
import {LeftOutlined, RightOutlined} from '@fluent-wallet/component-icons'
import {
  AccountDisplay,
  AlertMessage,
  CurrentNetworkDisplay,
  TransactionResult,
} from '../../components'
import ImageWithFallback from '../../components/ImageWithFallback'

import {ROUTES, RPC_METHODS, TX_STATUS} from '../../constants'
import {useBalance, usePendingAuthReq} from '../../hooks/useApi'
import {useEstimateError} from '../../hooks'
import useLoading from '../../hooks/useLoading'
import PageLoading from '../../hooks/useLoading/PageLoading'
import {bn16, request} from '../../utils'
import CallBundleCallCard from './components/CallBundleCallCard'
import CallBundleRequestSummary from './components/CallBundleRequestSummary'

import {Interface} from '@ethersproject/abi'
import {FUNGIBLE_TOKEN_ABI} from '@fluent-wallet/contract-abis/token-abi.js'
import {decodeCallData} from '@fluent-wallet/contract-method-name'
import {buildCallBundleTransaction} from '@fluent-wallet/eip-5792'
import TokenSpendingCapEditor from '../../components/TokenSpendingCapEditor'
import {useTokenMetadata} from '../../hooks/useTokenMetadata'
import CallBundleDataDetails from './components/CallBundleDataDetails'

import {useSponsorshipPreparation} from '../../hooks/useSponsorshipPreparation'
import {useCallBundleEstimate} from './useCallBundleEstimate'
import CallBundleGasEditor from './components/CallBundleGasEditor'
import CallBundleGasFee from './components/CallBundleGasFee'

import Eip7702DelegationDrawer from '../../components/Eip7702DelegationDrawer'

const {
  WALLET_SEND_CALLS,
  WALLET_SUBMIT_CALL_BUNDLE,
  WALLET_GET_PENDING_AUTH_REQUEST,
  WALLET_REJECT_PENDING_AUTH_REQUEST,
} = RPC_METHODS

const tokenInterface = new Interface(FUNGIBLE_TOKEN_ABI)

function ConfirmCallBundle() {
  const {t} = useTranslation()
  const {mutate} = useSWRConfig()
  const pendingAuthReq = usePendingAuthReq()
  const {loading, setLoading} = useLoading()

  const [retainedAuthReq, setRetainedAuthReq] = useState(null)
  const [reconfirmationAuthReqId, setReconfirmationAuthReqId] = useState(null)
  const [submissionError, setSubmissionError] = useState(null)
  const requestLocked = useRef(false)

  // Keep the approval visible after the background removes the pending request.
  const authReq = retainedAuthReq ?? pendingAuthReq?.[0]

  const handleSubmit = async submission => {
    if (requestLocked.current) {
      return
    }

    requestLocked.current = true
    setRetainedAuthReq(authReq)
    setLoading(true)

    try {
      const result = await request(WALLET_SUBMIT_CALL_BUNDLE, {
        ...submission,
        authReqId: authReq.eid,
      })

      if (result?.confirmationRequired) {
        const updatedAuthRequests = await request(
          WALLET_GET_PENDING_AUTH_REQUEST,
        )
        const updatedAuthReq = updatedAuthRequests.find(
          ({eid}) => eid === authReq.eid,
        )

        if (!updatedAuthReq) {
          throw new Error('Batch approval is no longer available')
        }

        await mutate([WALLET_GET_PENDING_AUTH_REQUEST], updatedAuthRequests, {
          revalidate: false,
        })

        setRetainedAuthReq(updatedAuthReq)
        setReconfirmationAuthReqId(authReq.eid)
        requestLocked.current = false
        return
      }

      if (result?.id !== authReq.req.bundleId) {
        throw new Error('Batch submission returned an unexpected bundle ID')
      }

      window.close()
    } catch (error) {
      setSubmissionError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (requestLocked.current) {
      return
    }

    requestLocked.current = true
    setRetainedAuthReq(authReq)
    setLoading(true)

    try {
      await request(WALLET_REJECT_PENDING_AUTH_REQUEST, {
        authReqId: authReq.eid,
      })
      window.close()
    } catch (error) {
      Message.error({
        content: error?.message ?? t('unCaughtErrMsg'),
        top: '10px',
        duration: 1,
      })
      requestLocked.current = false
    } finally {
      setLoading(false)
    }
  }

  if (!authReq && !pendingAuthReq) {
    return <PageLoading />
  }

  if (!authReq || authReq.req.method !== WALLET_SEND_CALLS) {
    return <Redirect to={ROUTES.HOME} />
  }

  return (
    <>
      <CallBundleConfirmation
        key={`${authReq.eid}:${reconfirmationAuthReqId}`}
        authReq={authReq}
        allowSponsorship={reconfirmationAuthReqId === null}
        disabled={loading || Boolean(submissionError)}
        onSubmit={handleSubmit}
        onReject={handleReject}
      />
      {submissionError && (
        <TransactionResult
          status={TX_STATUS.ERROR}
          sendError={submissionError}
          onClose={() => window.close()}
        />
      )}
    </>
  )
}

function CallBundleConfirmation({
  authReq,
  allowSponsorship,
  disabled,
  onSubmit,
  onReject,
}) {
  const {t} = useTranslation()
  const {
    from,
    chainId,
    atomicRequired,
    calls,
    transaction,
    requiredDelegationAction: transactionDelegationAction,
  } = authReq.req.params

  const {currentAccount, currentNetwork, site} = authReq.app

  const [expandedCallIndexes, setExpandedCallIndexes] = useState([])
  const [confirmationCalls, setConfirmationCalls] = useState(calls)
  const [confirmationTransaction, setConfirmationTransaction] =
    useState(transaction)
  const [editingAllowanceCallIndex, setEditingAllowanceCallIndex] =
    useState(null)
  const [isViewingData, setIsViewingData] = useState(false)

  const [gasSettings, setGasSettings] = useState(null)
  const [isEditingGas, setIsEditingGas] = useState(false)

  const [pendingDelegationAction, setPendingDelegationAction] = useState(null)
  const [sponsorshipDeclined, setSponsorshipDeclined] = useState(false)

  const sponsorship = useSponsorshipPreparation({
    accountId: currentAccount.eid,
    networkId: currentNetwork.eid,
    calls: allowSponsorship && !sponsorshipDeclined ? confirmationCalls : null,
  })
  const balances = useBalance(
    sponsorship.available ? from : null,
    currentNetwork.eid,
  )
  const nativeBalance = balances?.[from.toLowerCase()]?.['0x0']

  const totalCallValue = confirmationCalls.reduce(
    (total, call) => total.add(bn16(call.value)),
    bn16('0x0'),
  )

  const sponsoredBalanceCheck = {
    loading: sponsorship.available && nativeBalance === undefined,
    isBalanceEnough:
      nativeBalance === undefined
        ? undefined
        : bn16(nativeBalance).gte(totalCallValue),
  }

  const transactionEstimate = useCallBundleEstimate({
    transaction:
      sponsorship.loading || sponsorship.available
        ? null
        : confirmationTransaction,
    calls: confirmationCalls,
    network: currentNetwork,
    gasSettings,
  })

  const estimateError = useEstimateError(
    sponsorship.available
      ? sponsoredBalanceCheck
      : {...transactionEstimate.data, error: transactionEstimate.error},
    undefined,
    true,
  )

  const requiredDelegationAction = sponsorship.available
    ? sponsorship.requiredDelegationAction
    : transactionDelegationAction

  const canConfirm =
    !disabled &&
    !sponsorship.loading &&
    (sponsorship.available
      ? sponsoredBalanceCheck.isBalanceEnough === true
      : transactionEstimate.data?.isBalanceEnough === true)

  const isEditingAllowance = editingAllowanceCallIndex !== null
  const editingCall = isEditingAllowance
    ? confirmationCalls[editingAllowanceCallIndex]
    : null

  const isConfirmationVisible =
    !isEditingAllowance && !isViewingData && !isEditingGas

  const editingToken = useTokenMetadata({
    address: editingCall?.to,
    network: currentNetwork,
  })
  const editingApproval = editingCall ? decodeCallData(editingCall.data) : null
  const requestedApproval = editingCall
    ? decodeCallData(calls[editingAllowanceCallIndex].data)
    : null

  const toggleCallExpansion = callIndex => {
    setExpandedCallIndexes(indexes =>
      indexes.includes(callIndex)
        ? indexes.filter(index => index !== callIndex)
        : [...indexes, callIndex],
    )
  }

  const handleSaveAllowance = amount => {
    try {
      const data =
        amount === requestedApproval.args[1].toString()
          ? calls[editingAllowanceCallIndex].data
          : tokenInterface.encodeFunctionData('approve', [
              editingApproval.args[0],
              amount,
            ])

      if (data === editingCall.data) {
        setEditingAllowanceCallIndex(null)
        return
      }

      const updatedCalls = confirmationCalls.map((call, callIndex) =>
        callIndex === editingAllowanceCallIndex ? {...call, data} : call,
      )

      const updatedTransaction = buildCallBundleTransaction({
        from,
        chainId,
        calls: updatedCalls,
        authorizationAddress:
          confirmationTransaction.authorizationList?.[0]?.address,
      })

      setConfirmationCalls(updatedCalls)
      setConfirmationTransaction(updatedTransaction)
      setGasSettings(null)
      setEditingAllowanceCallIndex(null)
    } catch (error) {
      Message.error({
        content: error?.message ?? t('unCaughtErrMsg'),
        top: '10px',
        duration: 1,
      })
    }
  }

  const handleSaveGasSettings = settings => {
    setGasSettings(settings)
    setIsEditingGas(false)
  }

  const submitCallBundle = approvedDelegationAction => {
    if (sponsorship.available) {
      onSubmit({
        calls: confirmationCalls,
        sponsorship: {
          userOperation: sponsorship.userOperation,
        },
        ...(approvedDelegationAction ? {approvedDelegationAction} : {}),
      })
      return
    }

    onSubmit({
      calls: confirmationCalls,
      transaction: transactionEstimate.transaction,
    })
  }

  const handleConfirm = () => {
    if (requiredDelegationAction) {
      setPendingDelegationAction(requiredDelegationAction)
      return
    }

    submitCallBundle()
  }

  const handleBack = () => {
    if (isEditingAllowance) {
      setEditingAllowanceCallIndex(null)
    } else if (isViewingData) {
      setIsViewingData(false)
    } else {
      onReject()
    }
  }

  const handleDeclineDelegation = () => {
    setPendingDelegationAction(null)

    if (sponsorship.available && confirmationCalls.length === 1) {
      setSponsorshipDeclined(true)
      setGasSettings(null)
      return
    }

    onReject()
  }

  return (
    <div
      inert={disabled ? '' : undefined}
      className="relative flex h-full w-full flex-col bg-gray-0"
    >
      <header
        className={
          isEditingGas
            ? 'hidden'
            : 'relative flex h-13 shrink-0 items-center justify-center px-10'
        }
      >
        <button
          type="button"
          aria-label={t('back')}
          disabled={disabled}
          onClick={handleBack}
          className="absolute left-3 flex h-5 w-5 items-center justify-center text-gray-60 disabled:cursor-not-allowed"
        >
          <LeftOutlined className="h-5 w-5" />
        </button>
        <h1 className="text-center text-sm text-gray-100">
          {t(
            isEditingAllowance
              ? 'editPermission'
              : isViewingData
              ? 'transactionDetails'
              : 'signBatchTransaction',
          )}
        </h1>
      </header>

      {isEditingGas && (
        <CallBundleGasEditor
          transaction={confirmationTransaction}
          calls={confirmationCalls}
          network={currentNetwork}
          initialGasSettings={gasSettings}
          onSave={handleSaveGasSettings}
          onClose={() => setIsEditingGas(false)}
        />
      )}

      {isEditingAllowance && editingToken && (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-blue-circles bg-no-repeat bg-bg">
          <TokenSpendingCapEditor
            key={editingAllowanceCallIndex}
            requestedAmount={requestedApproval.args[1].toString()}
            currentAmount={editingApproval.args[1].toString()}
            decimals={editingToken.decimals}
            symbol={editingToken.symbol}
            dappOrigin={site.origin}
            onSave={handleSaveAllowance}
          />
        </div>
      )}

      {isViewingData && (
        <main className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <CallBundleDataDetails
            chainId={chainId}
            from={from}
            atomicRequired={atomicRequired}
            calls={confirmationCalls}
            network={currentNetwork}
          />
        </main>
      )}

      <main
        className={
          isConfirmationVisible
            ? 'min-h-0 flex-1 overflow-y-auto px-3 pt-3 pb-4'
            : 'hidden'
        }
      >
        <CallBundleRequestSummary callCount={confirmationCalls.length} />

        <ol className="mt-4 flex flex-col gap-4">
          {confirmationCalls.map((call, callIndex) => (
            <li key={`${authReq.eid}:${callIndex}`}>
              <CallBundleCallCard
                call={call}
                requestedData={calls[callIndex].data}
                callIndex={callIndex}
                network={currentNetwork}
                expanded={expandedCallIndexes.includes(callIndex)}
                onToggle={() => toggleCallExpansion(callIndex)}
                onEditAllowance={() => setEditingAllowanceCallIndex(callIndex)}
              />
            </li>
          ))}
        </ol>

        <dl className="mx-1 mt-4 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <dt className="shrink-0 text-gray-40">{t('myAccount')}</dt>
            <dd title={from}>
              <AccountDisplay
                address={from}
                nickname={currentAccount.nickname}
                showAvatar={false}
                addressClassName="order-1 text-right text-sm !font-normal"
                nicknameClassName="order-2 mt-0.5 max-w-60 truncate text-right text-xs text-gray-60"
              />
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4">
            <dt className="shrink-0 text-gray-40">{t('protocol')}</dt>
            <dd className="flex min-w-0 items-center gap-1">
              <ImageWithFallback
                src={site.icon}
                fallback="/images/default-dapp-icon.svg"
                alt=""
                className="h-4 w-4 shrink-0"
              />
              <span className="truncate text-gray-80" title={site.origin}>
                {site.origin}
              </span>
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4">
            <dt className="shrink-0 text-gray-40">{t('network')}</dt>
            <dd className="min-w-0" title={currentNetwork.name}>
              <CurrentNetworkDisplay
                currentNetwork={currentNetwork}
                containerClassName="min-w-0 justify-end"
                contentClassName="truncate"
              />
            </dd>
          </div>
        </dl>

        <div className="mt-4">
          <CallBundleGasFee
            sponsorship={sponsorship}
            sponsoredBalanceCheck={sponsoredBalanceCheck}
            transactionEstimate={transactionEstimate}
            network={currentNetwork}
            gasLevel={gasSettings?.gasLevel || 'medium'}
            onEdit={() => setIsEditingGas(true)}
          />
        </div>
      </main>

      {isConfirmationVisible && (
        <AlertMessage inline isDapp estimateError={estimateError} />
      )}

      <footer
        className={
          isConfirmationVisible
            ? 'flex shrink-0 flex-col items-center gap-4 px-4 pt-3 pb-4'
            : 'hidden'
        }
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsViewingData(true)}
          className="flex items-center text-sm text-primary hover:text-primary-dark disabled:cursor-not-allowed"
        >
          {t('viewData')}
          <RightOutlined className="ml-1 h-3 w-3" />
        </button>

        <div className="flex w-full gap-3">
          <Button
            type="button"
            variant="outlined"
            className="flex-1"
            disabled={disabled}
            onClick={onReject}
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {t('confirm')}
          </Button>
        </div>
      </footer>

      {pendingDelegationAction && (
        <Eip7702DelegationDrawer
          id="call-bundle-delegation"
          open
          showClose
          title={t(
            pendingDelegationAction === 'upgrade'
              ? 'eip7702SponsoredUpgradeTitle'
              : 'eip7702SponsoredSwitchTitle',
          )}
          description={t(
            sponsorship.available
              ? 'eip7702SponsoredDescription'
              : 'eip7702SponsoredUpgradeDesc',
          )}
          confirmText={t(
            pendingDelegationAction === 'upgrade'
              ? 'eip7702SponsoredUpgradeConfirm'
              : 'eip7702SponsoredSwitchConfirm',
          )}
          confirmDisabled={!canConfirm}
          onConfirm={() => {
            setPendingDelegationAction(null)
            submitCallBundle(pendingDelegationAction)
          }}
          onClose={handleDeclineDelegation}
        />
      )}
    </div>
  )
}

CallBundleConfirmation.propTypes = {
  authReq: PropTypes.object.isRequired,
  allowSponsorship: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
}
export default ConfirmCallBundle
