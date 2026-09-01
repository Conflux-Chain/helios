import {useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Link from '@fluent-wallet/component-link'
import Button from '@fluent-wallet/component-button'
import {RightOutlined} from '@fluent-wallet/component-icons'
import {
  formatDecimalToHex,
  formatHexToDecimal,
  convertDataToValue,
  convertValueToData,
} from '@fluent-wallet/data-format'
import {ETH_TX_TYPES, USER_OPERATION_ERROR_CODES} from '@fluent-wallet/consts'
import {
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
import {useCurrentAddress, useNetworkTypeIsCfx} from '../../hooks/useApi'
import {useConnect} from '../../hooks/useLedger'
import {
  request,
  getPageType,
  checkBalance,
  bn16,
  isGasSponsorshipConfigured,
  transformToTitleCase,
} from '../../utils'
import {
  AddressCard,
  ConfirmGasFee,
  Eip7702DelegationDrawer,
  Eip7702SwitchInfoDrawer,
  InfoList,
} from './components'
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

const {VIEW_DATA, HOME} = ROUTES
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
  const [estimateError, setEstimateError] = useState('')
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
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasLimit,
    storageLimit,
    nonce: suggestedNonce,
    customNonce,
    gasLevel,
    customAllowance,
    isMaxSelected,
    toAddress,
    setGasPrice,
    setMaxFeePerGas,
    setMaxPriorityFeePerGas,
    setGasLimit,
    setStorageLimit,
    setNonce: setSuggestedNonce,
    setCustomNonce,
    setGasLevel,
    clearSendTransactionParams,
    clearAdvancedGasSetting,
    tx: txParams,
    txContext,
    setSponsorshipDeclined,
  } = useCurrentTxParams()
  const effectiveNonce = customNonce || suggestedNonce
  const {setLoading} = useLoading()

  const {
    data: {
      nativeBalance,
      network: {eid: networkDbId, ticker, chainId, type: currentNetworkType},
      account: {eid: accountId},
    },
  } = useCurrentAddress()

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
  // The switch flow enters this page with PUSH. Gas pages return with POP, so
  // the drawer is only initialized as open on the first entry from switch.
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

  const type = displayAccount?.accountGroup?.vault?.type
  const isHwAccount = type === 'hw' && type !== undefined
  const isHwUnAuth = !authStatus && isHwAccount
  const isHwOpenAlert = authStatus && !isAppOpen && isHwAccount

  // params in wallet send or dapp send
  const originParams = {
    ...currentTx,
    ...(isInternalEip7702Tx ? {type: ETH_TX_TYPES.EIP7702} : {}),
  }
  const addressCardFromAddress = isInternalEip7702Tx
    ? originParams?.from
    : displayFromAddress
  const addressCardToAddress = isInternalEip7702Tx
    ? eip7702Display.delegateAddress
    : displayToAddress

  const uses1559Fees = useUses1559Fees(originParams?.type)

  // dapp send params
  const {
    gasPrice: initGasPrice,
    maxFeePerGas: initMaxFeePerGas,
    maxPriorityFeePerGas: initMaxPriorityFeePerGas,
    gas: initGasLimit,
    nonce: initNonce,
    storageLimit: initStorageLimit,
  } = dappTx
  // user can edit nonce, gasPrice and gas
  const inputParams = {
    ...originParams,
    gasPrice: formatDecimalToHex(gasPrice),
    maxFeePerGas: formatDecimalToHex(maxFeePerGas),
    maxPriorityFeePerGas: formatDecimalToHex(maxPriorityFeePerGas),
    gas: formatDecimalToHex(gasLimit),
    nonce: formatDecimalToHex(effectiveNonce),
    storageLimit: formatDecimalToHex(storageLimit),
  }
  // user can edit the approve limit
  const viewData = useViewData(inputParams, isApproveToken, decodeData, token)
  inputParams.data = viewData

  // send params, need to delete '' or undefined params,
  // otherwise cfx_sendTransaction will return params error
  if (!inputParams.gasPrice) delete inputParams.gasPrice
  if (!inputParams.maxFeePerGas) delete inputParams.maxFeePerGas
  if (!inputParams.maxPriorityFeePerGas) delete inputParams.maxPriorityFeePerGas
  if (!inputParams.nonce) delete inputParams.nonce
  if (!inputParams.gas) delete inputParams.gas
  if (!inputParams.storageLimit) delete inputParams.storageLimit
  if (!inputParams.data) delete inputParams.data

  const {address: displayTokenAddress} = displayToken || {}

  const isNativeToken = !displayTokenAddress
  const requestedTransactionEstimate =
    useEstimateTx(
      inputParams,
      !isNativeToken && isSendToken
        ? {
            [displayTokenAddress]: convertValueToData(
              displayValue,
              displayToken?.decimals,
            ),
          }
        : {},
    ) || {}
  const inputAmountHex = isNativeToken
    ? inputParams.value || '0x0'
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
      inputParams.to
        ? [
            {
              to: inputParams.to,
              ...(inputParams.value ? {value: inputParams.value} : {}),
              ...(inputParams.data ? {data: inputParams.data} : {}),
            },
          ]
        : null,
    [
      inputParams.data,
      inputParams.to,
      inputParams.value,
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
  const maxTransferValue = requestedTransactionEstimate.nativeMaxDrip

  const isSponsorshipRefreshRequired =
    sendError?.data?.code ===
    USER_OPERATION_ERROR_CODES.SPONSORSHIP_REFRESH_REQUIRED

  // A native MAX transfer must leave enough balance for gas when sponsorship is unavailable.
  let resolvedValue = inputParams.value
  if (
    !isDapp &&
    isMaxSelected &&
    isNativeToken &&
    isSendToken &&
    !sponsoredUserOperation.loading &&
    !isSponsoredSubmission &&
    maxTransferValue
  ) {
    resolvedValue = maxTransferValue
  }

  const isValueAdjustedForGas = resolvedValue !== inputParams.value
  const transactionParams = {
    ...inputParams,
    ...(isValueAdjustedForGas ? {value: resolvedValue} : {}),
  }
  const transactionEstimate = requestedTransactionEstimate
  const transactionEstimateRequired =
    !sponsoredUserOperation.loading && !isSponsoredSubmission

  const sendTransactionParams = {...transactionParams}

  if (!customNonce) {
    delete sendTransactionParams.nonce
  }

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

  const transactionDisplayValue = isValueAdjustedForGas
    ? convertDataToValue(resolvedValue, nativeToken?.decimals)
    : displayValue

  useEffect(() => {
    if (!isSponsoredSubmission) return

    if (customNonce) setCustomNonce('')

    if (gasLevel === 'advanced') {
      clearAdvancedGasSetting()
      setGasLevel('medium')
    }
  }, [
    isSponsoredSubmission,
    customNonce,
    gasLevel,
    clearAdvancedGasSetting,
    setCustomNonce,
    setGasLevel,
  ])

  // only need to estimate gas not need to get whether balance is enough
  // so do not pass the gas info params
  // if params include gasPrice/gasLimit/nonce will cause loop
  const originEstimateRst = useEstimateTx(originParams) || {}
  const {
    gasPrice: estimateGasPrice,
    maxFeePerGas: estimateMaxFeePerGas,
    maxPriorityFeePerGas: estimateMaxPriorityPerGas,
    gasLimit: estimateGasLimit,
    nonce: rpcNonce,
    storageCollateralized: estimateStorageLimit,
  } = originEstimateRst || {}
  const hasEnoughNativeTransferBalance =
    !isNativeToken ||
    bn16(nativeBalance || '0x0').gte(bn16(transactionParams.value || '0x0'))
  const canIgnoreGasBalanceError =
    hasEnoughNativeTransferBalance &&
    isNativeToken &&
    isValueAdjustedForGas
  const errorMessage = useEstimateError(
    transactionEstimate,
    displayTokenAddress,
    !displayTokenAddress,
    isSendToken,
    {
      ignoreGasBalanceError: canIgnoreGasBalanceError,
    },
  )
  const maxAmountError =
    isValueAdjustedForGas && !bn16(resolvedValue).gt(bn16('0x0'))
      ? t('gasFeeIsNotEnough')
      : ''

  useEffect(() => {
    setEstimateError(
      transactionEstimateRequired ? maxAmountError || errorMessage : '',
    )
  }, [errorMessage, maxAmountError, transactionEstimateRequired])

  // when dapp send, init the gas edit global store
  // internal 7702 tx also enters confirm page directly, so it uses the same init path.
  useEffect(() => {
    if (isDapp || isInternalEip7702Tx) {
      // store decimal number for dapp tx params
      !gasLimit &&
        setGasLimit(formatHexToDecimal(initGasLimit || estimateGasLimit || ''))
      !storageLimit &&
        setStorageLimit(
          formatHexToDecimal(initStorageLimit || estimateStorageLimit || ''),
        )
      !gasPrice &&
        setGasPrice(formatHexToDecimal(initGasPrice || estimateGasPrice || ''))
      !maxFeePerGas &&
        setMaxFeePerGas(
          formatHexToDecimal(initMaxFeePerGas || estimateMaxFeePerGas || ''),
        )
      !maxPriorityFeePerGas &&
        setMaxPriorityFeePerGas(
          formatHexToDecimal(
            initMaxPriorityFeePerGas || estimateMaxPriorityPerGas || '',
          ),
        )
      !suggestedNonce &&
        setSuggestedNonce(formatHexToDecimal(initNonce || rpcNonce || ''))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isDapp,
    isInternalEip7702Tx,
    initGasLimit,
    initNonce,
    initGasPrice,
    initMaxFeePerGas,
    initMaxPriorityFeePerGas,
    initStorageLimit,
    setGasPrice,
    setSuggestedNonce,
    setGasLimit,
    setStorageLimit,
    estimateGasPrice,
    estimateMaxFeePerGas,
    estimateMaxPriorityPerGas,
    estimateGasLimit,
    estimateStorageLimit,
    rpcNonce,
    gasLimit,
    storageLimit,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    suggestedNonce,
  ])

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
      setEstimateError(t(balanceError))
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

  const confirmDisabled =
    sponsoredUserOperation.loading ||
    (transactionEstimateRequired &&
      (!!estimateError ||
        transactionEstimate.loading ||
        Object.keys(transactionEstimate).length === 0)) ||
    (customAllowance && isDecoding)

  const dappConfirmParams = {
    tx: sendTransactionRpcParams,
  }

  const sponsorshipDrawerProps =
    pendingDelegationAction === 'upgrade'
      ? {
          title: t('eip7702SponsoredUpgradeTitle'),
          description: t('eip7702SponsoredUpgradeDesc'),
          confirmText: t('eip7702SponsoredUpgradeConfirm'),
        }
      : pendingDelegationAction === 'switch'
      ? {
          title: t('eip7702SwitchInfoTitle'),
          description: t('eip7702SwitchInfoDesc'),
          confirmText: t('eip7702SwitchInfoConfirm'),
        }
      : null
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
            clearAdvancedGasSetting()
            setGasLevel('medium')
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
            value={transactionDisplayValue}
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
            isDapp={isDapp}
            isSign={isSign}
            method={
              decodeData?.name ? transformToTitleCase(decodeData.name) : ''
            }
            allowance={transactionDisplayValue}
            value={transactionParams.value}
            pendingAuthReq={pendingAuthReq}
            decimals={nativeToken?.decimals}
            symbol={nativeToken?.symbol}
          />
          <ConfirmGasFee
            sponsoredUserOperation={sponsoredUserOperation}
            nativeToken={nativeToken}
            estimateRst={transactionEstimate}
            uses1559Fees={uses1559Fees}
          />
        </div>
        <div className="flex flex-col items-center">
          {isDapp && !!inputParams.data && inputParams.data !== '0x' && (
            <Link onClick={() => history.push(VIEW_DATA)} className="mb-6">
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
