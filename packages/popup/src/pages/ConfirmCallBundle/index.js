import PropTypes from 'prop-types'
import {useRef, useState} from 'react'
import {Redirect} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import Message from '@fluent-wallet/component-message'
import {useSWRConfig} from 'swr'
import {LeftOutlined, RightOutlined} from '@fluent-wallet/component-icons'
import {formatHexToDecimal} from '@fluent-wallet/data-format'
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
import {getGasLimitError} from '../../hooks/useGasFeeValidation'
import useLoading from '../../hooks/useLoading'
import PageLoading from '../../hooks/useLoading/PageLoading'
import {bn16, request} from '../../utils'
import CallBundleCallCard from './components/CallBundleCallCard'
import CallBundleRequestSummary from './components/CallBundleRequestSummary'

import {updateApprovalAmount} from '../../utils/approval'
import {decodeCallData} from '@fluent-wallet/contract-method-name'
import {buildCallBundleTransaction} from '@fluent-wallet/eip-5792'
import TokenSpendingCapEditor from '../../components/TokenSpendingCapEditor'
import {useTokenMetadata} from '../../hooks/useTokenMetadata'
import CallBundleDataDetails from './components/CallBundleDataDetails'

import {useSponsorshipPreparation} from '../../hooks/useSponsorshipPreparation'
import {useCallBundleEstimate} from './useCallBundleEstimate'
import CallBundleGasEditor from './components/CallBundleGasEditor'
import CallBundleGasFee from './components/CallBundleGasFee'

import {getSelectedGasLevel} from '../../utils/gas'
import {useSimulateTransaction} from '../../hooks/useSimulateTransaction'
import Eip7702DelegationDrawer from '../../components/Eip7702DelegationDrawer'

const {
  WALLET_SEND_CALLS,
  WALLET_SUBMIT_CALL_BUNDLE,
  WALLET_GET_PENDING_AUTH_REQUEST,
  WALLET_REJECT_PENDING_AUTH_REQUEST,
} = RPC_METHODS

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
  const [view, setView] = useState({type: 'confirm'})

  const [txOptions, setTxOptions] = useState(
    /** @type {import('../../utils/gas').TxOptions|null} */ (null),
  )

  const [pendingDelegationAction, setPendingDelegationAction] = useState(null)
  const [sponsorshipDeclined, setSponsorshipDeclined] = useState(false)

  const isConfirmationVisible = view.type === 'confirm'
  const isEditingGas = view.type === 'gas'
  const isViewingData = view.type === 'data'
  const isEditingAllowance = view.type === 'allowance'

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
    txOptions,
  })

  const estimatedGasUsed = formatHexToDecimal(transactionEstimate.data?.gasUsed)
  const gasLimitError = getGasLimitError(
    {
      gasLimit: formatHexToDecimal(transactionEstimate.transaction?.gas),
      minGasLimit: estimatedGasUsed,
    },
    t,
  )

  const transactionError = useEstimateError(
    sponsorship.available
      ? sponsoredBalanceCheck
      : {...transactionEstimate.data, error: transactionEstimate.error},
    undefined,
    true,
  )

  const estimateError = sponsorship.available
    ? transactionError
    : gasLimitError || transactionError

  const isTransactionReady =
    Boolean(transactionEstimate.transaction?.gas) &&
    estimatedGasUsed !== undefined &&
    !gasLimitError &&
    transactionEstimate.data?.isBalanceEnough === true

  const canConfirm =
    isConfirmationVisible &&
    !disabled &&
    !sponsorship.loading &&
    (sponsorship.available
      ? sponsoredBalanceCheck.isBalanceEnough === true
      : isTransactionReady)

  const gasLevel = getSelectedGasLevel({
    tx: confirmationTransaction,
    txOptions,
    uses1559Fees: true,
  })

  const requiredDelegationAction = sponsorship.available
    ? sponsorship.requiredDelegationAction
    : transactionDelegationAction

  const {showSimulate, simulateDisabled, onSimulate} = useSimulateTransaction({
    transaction: transactionEstimate.simulationTransaction,
    network: currentNetwork,
    sponsorshipLoading: sponsorship.loading,
    sponsored: sponsorship.available,
    estimationLoading: transactionEstimate.loading,
    disabled,
  })

  const editingCall = isEditingAllowance
    ? confirmationCalls[view.callIndex]
    : null
  const editingToken = useTokenMetadata({
    address: editingCall?.to,
    network: currentNetwork,
  })
  const editingApproval = editingCall ? decodeCallData(editingCall.data) : null
  const requestedApproval = editingCall
    ? decodeCallData(calls[view.callIndex].data)
    : null

  const toggleCallExpansion = callIndex => {
    setExpandedCallIndexes(indexes =>
      indexes.includes(callIndex)
        ? indexes.filter(index => index !== callIndex)
        : [...indexes, callIndex],
    )
  }

  const handleSaveAllowance = amountInBaseUnits => {
    try {
      const data = updateApprovalAmount(
        calls[view.callIndex].data,
        amountInBaseUnits,
      )

      if (data === editingCall.data) {
        setView({type: 'confirm'})
        return
      }

      const updatedCalls = confirmationCalls.map((call, callIndex) =>
        callIndex === view.callIndex ? {...call, data} : call,
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

      setTxOptions(current =>
        current
          ? {
              ...current,
              gasLimit: '',
              storageLimit: '',
            }
          : current,
      )

      setView({type: 'confirm'})
    } catch (error) {
      Message.error({
        content: error?.message ?? t('unCaughtErrMsg'),
        top: '10px',
        duration: 1,
      })
    }
  }

  const handleSaveTxOptions = nextTxOptions => {
    setTxOptions(nextTxOptions)
    setView({type: 'confirm'})
  }

  const submitCallBundle = approvedDelegationAction => {
    if (!canConfirm) return
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
    if (!canConfirm) return
    if (requiredDelegationAction) {
      setPendingDelegationAction(requiredDelegationAction)
      return
    }

    submitCallBundle()
  }

  const handleBack = () => {
    if (isConfirmationVisible) {
      onReject()
    } else {
      setView({type: 'confirm'})
    }
  }

  const handleDeclineDelegation = () => {
    setPendingDelegationAction(null)

    if (sponsorship.available && confirmationCalls.length === 1) {
      setSponsorshipDeclined(true)
      setTxOptions(null)
      return
    }

    onReject()
  }

  let titleKey = 'signBatchTransaction'

  if (isEditingAllowance) {
    titleKey = 'editPermission'
  } else if (isViewingData) {
    titleKey = 'transactionDetails'
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
        <h1 className="text-center text-sm text-gray-100">{t(titleKey)}</h1>
      </header>

      {isEditingGas && (
        <CallBundleGasEditor
          transaction={confirmationTransaction}
          calls={confirmationCalls}
          network={currentNetwork}
          initialTxOptions={txOptions}
          onSave={handleSaveTxOptions}
          onClose={handleBack}
        />
      )}

      {isEditingAllowance && editingToken && (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-blue-circles bg-no-repeat bg-bg">
          <TokenSpendingCapEditor
            key={view.callIndex}
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
                onEditAllowance={() => setView({type: 'allowance', callIndex})}
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
            gasLevel={gasLevel}
            onEdit={() => setView({type: 'gas'})}
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
          onClick={() => setView({type: 'data'})}
          className="flex items-center text-sm text-primary hover:text-primary-dark disabled:cursor-not-allowed"
        >
          {t('viewData')}
          <RightOutlined className="ml-1 h-3 w-3" />
        </button>
        {showSimulate && (
          <button
            id="simulateBtn"
            type="button"
            className="mt-2 flex items-center justify-center px-3 py-1 rounded-[4px] text-sm font-normal bg-[#F0F3FF] text-[#808BE7] cursor-pointer disabled:bg-gray-20 disabled:text-gray-40 disabled:cursor-not-allowed"
            disabled={simulateDisabled}
            onClick={onSimulate}
          >
            {t('simulate')}
          </button>
        )}

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
          {showSimulate && (
            <Button
              type="button"
              variant="outlined"
              className="flex-1"
              disabled={simulateDisabled}
              onClick={onSimulate}
            >
              {t('simulate')}
            </Button>
          )}
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
