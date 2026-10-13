import {useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Link from '@fluent-wallet/component-link'
import Button from '@fluent-wallet/component-button'
import Message from '@fluent-wallet/component-message'
import {RightOutlined} from '@fluent-wallet/component-icons'
import {
  Big,
  formatHexToDecimal,
  convertDataToValue,
  convertValueToData,
} from '@fluent-wallet/data-format'
import {ETH_TX_TYPES, USER_OPERATION_ERROR_CODES} from '@fluent-wallet/consts'
import {
  padHexData,
  useCurrentTxParams,
  useEstimateTx,
  useEstimateError,
  useDecodeData,
  useDecodeDisplay,
  useDappParams,
  useViewData,
  useLedgerBindingApi,
  useUses1559Fees,
} from '../../hooks'
import {
  useCurrentAddress,
  useNetworkTypeIsCfx,
  useCfxMaxGasLimit,
} from '../../hooks/useApi'
import {getGasLimitError} from '../../hooks/useGasFeeValidation'
import {useConnect} from '../../hooks/useLedger'
import {
  request,
  getPageType,
  checkBalance,
  bn16,
  isEditableTokenApproval,
  isGasSponsorshipConfigured,
  transformToTitleCase,
} from '../../utils'
import {
  AddressCard,
  ConfirmGasFee,
  Eip7702SwitchInfoDrawer,
  InfoList,
} from './components'
import Eip7702DelegationDrawer from '../../components/Eip7702DelegationDrawer'
import {
  TitleNav,
  DappFooter,
  TransactionResult,
  AlertMessage,
} from '../../components'
import {
  ROUTES,
  RPC_METHODS,
  LEDGER_AUTH_STATUS,
  LEDGER_OPEN_STATUS,
  TX_STATUS,
} from '../../constants'
import useLoading from '../../hooks/useLoading'
import useSponsoredUserOperation from './useSponsoredUserOperation'
import {updateApprovalAmount} from '../../utils/approval'
import {applyTxOptions, getSelectedGasLevel} from '../../utils/gas'
import ViewData from '../ViewData'
import EditAllowance from '../EditAllowance'
import EditGasFee from '../EditGasFee'

const {HOME} = ROUTES

const {
  CFX_SEND_TRANSACTION,
  ETH_SEND_TRANSACTION,
  WALLET_GET_PENDING_AUTH_REQUEST,
  WALLET_SEND_USER_OPERATION,
} = RPC_METHODS

const EIP7702_ACTION_TITLE_KEYS = {
  bind: 'eip7702Delegation',
  switch: 'eip7702Switch',
  revoke: 'eip7702Revoke',
}

function getInternalEip7702Display({tx, isDapp, action}) {
  const authorizationList = tx?.authorizationList
  const isInternalEip7702Tx =
    !isDapp && Array.isArray(authorizationList) && authorizationList.length > 0

  if (!isInternalEip7702Tx) {
    return {
      isInternalEip7702Tx: false,
      delegateAddress: '',
      titleKey: '',
      toAddressLabelKey: '',
    }
  }

  return {
    isInternalEip7702Tx: true,
    delegateAddress: authorizationList[0]?.address || '',
    titleKey: EIP7702_ACTION_TITLE_KEYS[action] || 'eip7702Delegation',
    toAddressLabelKey: 'delegateTo',
  }
}

function ConfirmTransaction() {
  const ledgerBindingApi = useLedgerBindingApi()

  const {t} = useTranslation()
  const history = useHistory()
  const [view, setView] = useState('confirm')

  const {authStatus: authStatusFromLedger, isAppOpen: isAppOpenFromLedger} =
    useConnect()
  const [authStatus, setAuthStatus] = useState(true)
  const [isAppOpen, setIsAppOpen] = useState(true)
  useEffect(() => {
    setAuthStatus(
      authStatusFromLedger === LEDGER_AUTH_STATUS.UNAUTHED ? false : true,
    )
    setIsAppOpen(
      isAppOpenFromLedger === LEDGER_OPEN_STATUS.UNOPEN ? false : true,
    )
  }, [authStatusFromLedger, isAppOpenFromLedger])
  const [sendStatus, setSendStatus] = useState()
  const [sendError, setSendError] = useState({})
  const [balanceCheckError, setBalanceCheckError] = useState('')
  const [pendingAuthReq, setPendingAuthReq] = useState()
  const isDapp = getPageType() === 'notification'
  useEffect(() => {
    if (isDapp)
      request(WALLET_GET_PENDING_AUTH_REQUEST).then(result =>
        setPendingAuthReq(result),
      )
  }, [isDapp])
  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const SEND_TRANSACTION = networkTypeIsCfx
    ? CFX_SEND_TRANSACTION
    : ETH_SEND_TRANSACTION
  const {
    txOptions,
    setTxOptions,
    customAllowance,
    setCustomAllowance,
    isMaxSelected,
    toAddress,
    clearSendTransactionParams,
    tx: txParams,
    txContext,
    setSponsorshipDeclined,
  } = useCurrentTxParams()

  const {setLoading} = useLoading()

  const {
    data: {
      network,
      account: {eid: accountId},
    },
  } = useCurrentAddress()
  const {eid: networkDbId, ticker, chainId, type: currentNetworkType} = network
  const maxGasLimit = useCfxMaxGasLimit(networkTypeIsCfx)

  const nativeToken = ticker || {}
  const dappTx = useDappParams(pendingAuthReq)
  const currentTx = isDapp ? dappTx : txParams
  const eip7702Action = txContext?.eip7702Action
  const eip7702Display = getInternalEip7702Display({
    tx: currentTx,
    isDapp,
    action: eip7702Action,
  })
  const {isInternalEip7702Tx} = eip7702Display
  // Open the switch drawer only on the initial entry from the switch flow.
  const shouldOpenSwitchInfoDrawerOnMount =
    isInternalEip7702Tx &&
    eip7702Action === 'switch' &&
    history.action === 'PUSH'
  const [isSwitchInfoDrawerOpen, setIsSwitchInfoDrawerOpen] = useState(
    () => shouldOpenSwitchInfoDrawerOnMount,
  )

  const [pendingDelegationAction, setPendingDelegationAction] = useState(null)

  // get to type and to token
  const {isContract, decodeData, isEOAAddress, token, isDecoding} =
    useDecodeData(currentTx)
  const {
    isApproveToken,
    isSendToken,
    displayToken,
    displayValue,
    displayFromAddress,
    displayAccount,
    displayToAddress,
  } = useDecodeDisplay({
    deps: [chainId, accountId],
    isDapp,
    isContract,
    isEOAAddress,
    nativeToken,
    tx: currentTx,
    pendingAuthReq: pendingAuthReq?.[0],
    decodeData,
    token,
  })
  const isSign = !isSendToken && !isApproveToken
  const canEditAllowance =
    isApproveToken && isEditableTokenApproval({decodedCall: decodeData, token})

  const requestedAmountInBaseUnits = canEditAllowance
    ? decodeData.args[1].toString()
    : null

  const currentAmountInBaseUnits =
    canEditAllowance && customAllowance !== undefined
      ? customAllowance
      : requestedAmountInBaseUnits

  const displayAllowance =
    isApproveToken && customAllowance !== undefined
      ? new Big(customAllowance).times(`1e-${token.decimals}`).toFixed()
      : displayValue

  const type = displayAccount?.accountGroup?.vault?.type
  const isHwAccount = type === 'hw' && type !== undefined
  const isHwUnAuth = !authStatus && isHwAccount
  const isHwOpenAlert = authStatus && !isAppOpen && isHwAccount

  // params in wallet send or dapp send
  const originParams = {
    ...currentTx,
    ...(isInternalEip7702Tx ? {type: ETH_TX_TYPES.EIP7702} : {}),
  }
  delete originParams.nonce

  const addressCardFromAddress = isInternalEip7702Tx
    ? originParams?.from
    : displayFromAddress
  const addressCardToAddress = isInternalEip7702Tx
    ? eip7702Display.delegateAddress
    : displayToAddress

  const uses1559Fees = useUses1559Fees(originParams?.type)

  // Both estimates use the current approval data.
  const transactionData = useViewData(originParams, isApproveToken, decodeData)
  const transaction = {...originParams, data: transactionData}

  if (!transaction.data) delete transaction.data

  const estimateParams = {...transaction}
  delete estimateParams.gas
  delete estimateParams.storageLimit

  const baseEstimate = useEstimateTx(estimateParams) || {}

  const txWithOptions = applyTxOptions({
    tx: transaction,
    txOptions,
    estimate: baseEstimate,
    uses1559Fees,
  })

  const hasGasPrices =
    uses1559Fees !== undefined &&
    Boolean(
      uses1559Fees
        ? txWithOptions.maxFeePerGas && txWithOptions.maxPriorityFeePerGas
        : txWithOptions.gasPrice,
    )

  const gasLevel = getSelectedGasLevel({
    tx: transaction,
    txOptions,
    uses1559Fees,
  })

  const {address: displayTokenAddress} = displayToken || {}

  const isNativeToken = !displayTokenAddress
  const transactionEstimate =
    useEstimateTx(
      hasGasPrices ? txWithOptions : null,
      !isNativeToken && isSendToken
        ? {
            [displayTokenAddress]: convertValueToData(
              displayValue,
              displayToken?.decimals,
            ),
          }
        : {},
    ) || {}
  const estimateRst = hasGasPrices
    ? transactionEstimate
    : {
        loading: !baseEstimate.error,
        error: baseEstimate.error,
      }

  const inputAmountHex = isNativeToken
    ? txWithOptions.value || '0x0'
    : isSendToken
    ? convertValueToData(displayValue, displayToken?.decimals)
    : '0x0'

  const dappApp = isDapp ? pendingAuthReq?.[0]?.app : null
  const transactionAccountId = isDapp ? dappApp?.currentAccount?.eid : accountId
  const transactionNetworkId = isDapp
    ? dappApp?.currentNetwork?.eid
    : networkDbId
  const transactionNetworkType = isDapp
    ? dappApp?.currentNetwork?.type
    : currentNetworkType
  const shouldPrepareSponsorship =
    !isDapp &&
    isGasSponsorshipConfigured({
      chainId,
      networkType: transactionNetworkType,
    })

  const userOperationCalls = useMemo(
    () =>
      shouldPrepareSponsorship &&
      !isInternalEip7702Tx &&
      toAddress &&
      txWithOptions.to
        ? [
            {
              to: txWithOptions.to,
              ...(txWithOptions.value ? {value: txWithOptions.value} : {}),
              ...(txWithOptions.data ? {data: txWithOptions.data} : {}),
            },
          ]
        : null,
    [
      txWithOptions.data,
      txWithOptions.to,
      txWithOptions.value,
      shouldPrepareSponsorship,
      isInternalEip7702Tx,
      toAddress,
    ],
  )
  const sponsoredUserOperation = useSponsoredUserOperation({
    networkId: transactionNetworkId,
    accountId: transactionAccountId,
    calls: userOperationCalls,
  })

  const isSponsoredSubmission = sponsoredUserOperation.isActive
  const maxValueAfterGas = estimateRst.nativeMaxDrip

  // MAX starts as the full balance while sponsorship is checked. If sponsorship
  // is unavailable, reserve the estimated gas fee before sending.
  const shouldSubtractGasFromMax =
    !isDapp &&
    !isInternalEip7702Tx &&
    isMaxSelected &&
    isNativeToken &&
    !sponsoredUserOperation.loading &&
    !isSponsoredSubmission &&
    maxValueAfterGas !== undefined

  const sendValue = shouldSubtractGasFromMax
    ? maxValueAfterGas
    : txWithOptions.value

  // Recheck the balance flag against the value that will actually be sent.
  const estimateForSend = shouldSubtractGasFromMax
    ? {
        ...estimateRst,
        isBalanceEnough: bn16(estimateRst.balanceDrip).gte(
          bn16(sendValue).add(bn16(estimateRst.txFeeDrip)),
        ),
      }
    : estimateRst

  const isSponsorshipRefreshRequired =
    sendError?.data?.code ===
    USER_OPERATION_ERROR_CODES.SPONSORSHIP_REFRESH_REQUIRED

  const sendTransactionParams = {
    ...txWithOptions,
    gas: txWithOptions.gas || estimateRst.gasLimit,
    ...(networkTypeIsCfx
      ? {
          storageLimit:
            txWithOptions.storageLimit || estimateRst.storageCollateralized,
        }
      : {}),
    ...(shouldSubtractGasFromMax ? {value: sendValue} : {}),
  }

  const estimatedGasUsed = formatHexToDecimal(estimateRst.gasUsed)
  const gasLimitError = hasGasPrices
    ? getGasLimitError(
        {
          gasLimit: formatHexToDecimal(sendTransactionParams.gas),
          minGasLimit: estimatedGasUsed,
          maxGasLimit: formatHexToDecimal(maxGasLimit),
        },
        t,
      )
    : ''

  const sendTransactionRpcParams = [sendTransactionParams]

  const sponsoredUserOperationRpcParams = {
    accountId: transactionAccountId,
    networkId: transactionNetworkId,
    calls: userOperationCalls,
    sponsorship: {
      userOperation: sponsoredUserOperation.userOperation,
    },
  }

  const sendTokenValue =
    isSendToken && !isNativeToken && Object.keys(displayToken || {}).length
      ? inputAmountHex
      : '0x0'

  const sendDisplayValue = shouldSubtractGasFromMax
    ? convertDataToValue(sendValue, nativeToken?.decimals)
    : displayValue

  const feePerGas = formatHexToDecimal(
    uses1559Fees
      ? sendTransactionParams.maxFeePerGas || estimateForSend.maxFeePerGas
      : sendTransactionParams.gasPrice || estimateForSend.gasPrice,
  )

  useEffect(() => {
    if (!isSponsoredSubmission) return

    if (
      !txOptions.nonce &&
      !txOptions.gasPrice &&
      !txOptions.maxFeePerGas &&
      !txOptions.maxPriorityFeePerGas
    ) {
      return
    }

    setTxOptions({
      ...txOptions,
      gasLevel: 'medium',
      gasPrice: '',
      maxFeePerGas: '',
      maxPriorityFeePerGas: '',
      nonce: '',
    })
  }, [isSponsoredSubmission, txOptions, setTxOptions])

  const transactionError = useEstimateError(
    estimateForSend,
    displayTokenAddress,
    !displayTokenAddress,
    isSendToken,
  )
  const errorMessage = gasLimitError || transactionError

  const maxAmountError =
    shouldSubtractGasFromMax && !bn16(sendValue).gt(bn16('0x0'))
      ? t('gasFeeIsNotEnough')
      : ''

  const estimateError =
    sponsoredUserOperation.loading || isSponsoredSubmission
      ? ''
      : maxAmountError || errorMessage || balanceCheckError

  const isTransactionReady =
    hasGasPrices &&
    Boolean(sendTransactionParams.gas) &&
    estimatedGasUsed !== undefined &&
    estimateForSend.isBalanceEnough === true &&
    !maxAmountError &&
    !errorMessage &&
    !estimateForSend.error &&
    !estimateForSend.loading

  const confirmDisabled =
    view !== 'confirm' ||
    sponsoredUserOperation.loading ||
    (!isSponsoredSubmission && !isTransactionReady) ||
    (customAllowance !== undefined && isDecoding)

  const beginSubmission = () => {
    if (!isHwAccount) setLoading(true)
    else setSendStatus(TX_STATUS.HW_WAITING)
  }

  const resetSubmissionStatus = () => {
    if (!isHwAccount) setLoading(false)
    else setSendStatus(undefined)
  }

  const completeSubmission = () => {
    if (!isHwAccount) setLoading(false)
    else setSendStatus(TX_STATUS.HW_SUCCESS)

    setTimeout(() => clearSendTransactionParams(), 500)
    history.push(HOME)
  }

  const failSubmission = error => {
    console.error('error', error)

    if (!isHwAccount) setLoading(false)
    setSendStatus(TX_STATUS.ERROR)
    setSendError(error)
  }

  const submitTransaction = async () => {
    if (confirmDisabled) return

    setBalanceCheckError('')
    beginSubmission()

    const balanceError = await checkBalance(
      sendTransactionParams,
      displayToken,
      isNativeToken,
      isSendToken,
      sendTokenValue,
      networkTypeIsCfx,
      uses1559Fees,
    )

    if (balanceError) {
      resetSubmissionStatus()
      setBalanceCheckError(t(balanceError))
      return
    }

    try {
      await request(SEND_TRANSACTION, sendTransactionRpcParams)
      completeSubmission()
    } catch (error) {
      failSubmission(error)
    }
  }

  const submitSponsoredUserOperation = async ({
    approvedDelegationAction,
  } = {}) => {
    if (confirmDisabled) return

    beginSubmission()

    try {
      await request(WALLET_SEND_USER_OPERATION, {
        ...sponsoredUserOperationRpcParams,
        ...(approvedDelegationAction ? {approvedDelegationAction} : {}),
      })
      completeSubmission()
    } catch (error) {
      const errorData = error?.data || error?.extra
      const requiredDelegationAction = errorData?.requiredDelegationAction

      const needsDelegationConfirmation =
        errorData?.code ===
          USER_OPERATION_ERROR_CODES.EIP7702_DELEGATION_CONFIRMATION_REQUIRED &&
        (requiredDelegationAction === 'upgrade' ||
          requiredDelegationAction === 'switch')

      if (needsDelegationConfirmation) {
        resetSubmissionStatus()
        setSendError({})
        setSponsorshipDeclined(false)
        setPendingDelegationAction(requiredDelegationAction)
        return
      }

      failSubmission(error)
    }
  }

  const onSend = async () => {
    if (confirmDisabled) return

    if (isHwAccount) {
      if (!ledgerBindingApi) {
        return
      }

      const authStatus = await ledgerBindingApi.isDeviceAuthed()
      const isAppOpen = await ledgerBindingApi.isAppOpen()

      if (!authStatus) {
        setAuthStatus(authStatus)
        return
      }

      if (!isAppOpen) {
        setIsAppOpen(isAppOpen)
        return
      }
    }
    if (isSponsoredSubmission) {
      if (sponsoredUserOperation.requiredDelegationAction) {
        setPendingDelegationAction(
          sponsoredUserOperation.requiredDelegationAction,
        )
        return
      }

      await submitSponsoredUserOperation()
      return
    }

    await submitTransaction()
  }

  const confirmPendingDelegation = () => {
    if (!pendingDelegationAction) return

    const approvedDelegationAction = pendingDelegationAction
    setPendingDelegationAction(null)

    void submitSponsoredUserOperation({approvedDelegationAction})
  }

  const declinePendingDelegation = () => {
    setPendingDelegationAction(null)
    setSponsorshipDeclined(true)
  }

  const onCloseTransactionResult = () => {
    if (isSponsorshipRefreshRequired) {
      setSendStatus(undefined)
      setSendError({})
      void sponsoredUserOperation.prepare()
      return
    }

    clearSendTransactionParams()

    if (isDapp) {
      window.close()
      return
    }

    history.push(HOME)
  }

  const onCancel = () => {
    clearSendTransactionParams()
    if (isInternalEip7702Tx) {
      history.goBack()
      return
    }
    history.push(HOME)
  }

  const dappConfirmParams = {
    tx: sendTransactionRpcParams,
  }

  const sponsorshipDrawerProps =
    pendingDelegationAction === 'upgrade'
      ? {
          title: t('eip7702SponsoredUpgradeTitle'),
          description: t('eip7702SponsoredDescription'),
          confirmText: t('eip7702SponsoredUpgradeConfirm'),
        }
      : pendingDelegationAction === 'switch'
      ? {
          title: t('eip7702SponsoredSwitchTitle'),
          description: t('eip7702SponsoredDescription'),
          confirmText: t('eip7702SponsoredSwitchConfirm'),
        }
      : null

  const handleSaveAllowance = amountInBaseUnits => {
    try {
      const nextAllowance =
        amountInBaseUnits === requestedAmountInBaseUnits
          ? undefined
          : amountInBaseUnits

      if (nextAllowance !== customAllowance) {
        // Ensure the approval can be encoded before changing saved state.
        updateApprovalAmount(padHexData(currentTx.data), amountInBaseUnits)

        setCustomAllowance(nextAllowance)
        setBalanceCheckError('')
      }

      setView('confirm')
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
    setBalanceCheckError('')
    setView('confirm')
  }

  if (view === 'gas') {
    return (
      <EditGasFee
        tx={transaction}
        initialTxOptions={txOptions}
        onSave={handleSaveTxOptions}
        onBack={() => setView('confirm')}
      />
    )
  }

  if (view === 'allowance' && canEditAllowance) {
    return (
      <EditAllowance
        key={pendingAuthReq?.[0]?.eid}
        requestedAmount={requestedAmountInBaseUnits}
        currentAmount={currentAmountInBaseUnits}
        decimals={token.decimals}
        symbol={token.symbol}
        dappOrigin={dappApp?.site?.origin}
        onSave={handleSaveAllowance}
        onBack={() => setView('confirm')}
      />
    )
  }

  if (view === 'data' && dappApp) {
    return (
      <ViewData
        transaction={sendTransactionParams}
        network={dappApp.currentNetwork}
        onBack={() => setView('confirm')}
      />
    )
  }
  return (
    <div className="confirm-transaction-container flex flex-col h-full w-full relative">
      <header>
        <TitleNav
          title={t('signTransaction')}
          hasGoBack={!isDapp}
          onGoBack={() => {
            if (isInternalEip7702Tx) {
              clearSendTransactionParams()
              return
            }
            setTxOptions({nonce: txOptions.nonce})
          }}
        />
      </header>
      <div className="confirm-transaction-body flex flex-1 flex-col justify-between mt-1 pb-6">
        <div className="flex flex-col px-3">
          <AddressCard
            nickname={displayAccount?.nickname}
            token={displayToken}
            fromAddress={addressCardFromAddress}
            toAddress={addressCardToAddress}
            value={sendDisplayValue}
            isSendToken={isSendToken}
            isApproveToken={isApproveToken}
            title={
              eip7702Display.titleKey ? t(eip7702Display.titleKey) : undefined
            }
            toAddressLabel={
              eip7702Display.toAddressLabelKey
                ? t(eip7702Display.toAddressLabelKey)
                : undefined
            }
          />
          <InfoList
            token={displayToken}
            isApproveToken={isApproveToken}
            canEditAllowance={canEditAllowance}
            onEditAllowance={() => setView('allowance')}
            isDapp={isDapp}
            isSign={isSign}
            method={
              decodeData?.name ? transformToTitleCase(decodeData.name) : ''
            }
            allowance={displayAllowance}
            value={sendTransactionParams.value}
            pendingAuthReq={pendingAuthReq}
            decimals={nativeToken?.decimals}
            symbol={nativeToken?.symbol}
          />
          <ConfirmGasFee
            sponsoredUserOperation={sponsoredUserOperation}
            nativeToken={nativeToken}
            estimateRst={estimateForSend}
            feePerGas={feePerGas}
            editLabel={uses1559Fees ? t(gasLevel) : t('edit')}
            onEdit={() => setView('gas')}
          />
        </div>
        <div className="flex flex-col items-center">
          {isDapp &&
            dappApp &&
            !!txWithOptions.data &&
            txWithOptions.data !== '0x' && (
              <Link onClick={() => setView('data')} className="mb-6">
                {t('viewData')}
                <RightOutlined className="w-3 h-3 text-primary ml-1" />
              </Link>
            )}

          {!isDapp && !isSwitchInfoDrawerOpen && !pendingDelegationAction && (
            <div className="w-full flex px-3 z-50">
              <Button
                variant="outlined"
                className="flex-1 mr-3"
                onClick={onCancel}
              >
                {t('cancel')}
              </Button>
              <Button
                className="flex-1"
                onClick={onSend}
                disabled={confirmDisabled}
              >
                {t('confirm')}
              </Button>
            </div>
          )}

          {isDapp && (
            <DappFooter
              confirmText={t('confirm')}
              cancelText={t('cancel')}
              confirmDisabled={confirmDisabled}
              confirmParams={dappConfirmParams}
              setSendStatus={setSendStatus}
              pendingAuthReq={pendingAuthReq}
              isHwAccount={isHwAccount}
              setAuthStatus={setAuthStatus}
              setSendError={setSendError}
              setIsAppOpen={setIsAppOpen}
              showError={false}
            />
          )}
          <AlertMessage
            isDapp={isDapp}
            isHwUnAuth={isHwUnAuth}
            isHwOpenAlert={isHwOpenAlert}
            estimateError={estimateError}
          />
          {(isHwAccount || sendStatus === TX_STATUS.ERROR) && (
            <TransactionResult
              status={sendStatus}
              sendError={sendError}
              onClose={onCloseTransactionResult}
            />
          )}
        </div>
      </div>
      <Eip7702SwitchInfoDrawer
        open={isSwitchInfoDrawerOpen}
        onClose={() => setIsSwitchInfoDrawerOpen(false)}
      />
      {pendingDelegationAction && sponsorshipDrawerProps && (
        <Eip7702DelegationDrawer
          id="eip7702-sponsored-delegation"
          {...sponsorshipDrawerProps}
          showClose
          open
          onConfirm={confirmPendingDelegation}
          onClose={declinePendingDelegation}
        />
      )}
    </div>
  )
}

export default ConfirmTransaction
