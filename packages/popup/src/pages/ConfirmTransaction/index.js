import {useState, useEffect} from 'react'
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
import {ETH_TX_TYPES} from '@fluent-wallet/consts'
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
  transformToTitleCase,
} from '../../utils'
import {
  AddressCard,
  ConfirmGasFee,
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
  MAX_STRATEGY,
} from '../../constants'
import useLoading from '../../hooks/useLoading'
import useTokenPayGas from './useTokenPayGas'
import useAdjustedSendTx from './useAdjustedSendTx'

const {VIEW_DATA, HOME} = ROUTES
const {
  CFX_SEND_TRANSACTION,
  ETH_SEND_TRANSACTION,
  WALLET_GET_PENDING_AUTH_REQUEST,
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
    nonce,
    gasLevel,
    customAllowance,
    gasTokenAddress,
    sendAmount,
    maxStrategy,
    setGasTokenAddress,
    setGasPrice,
    setMaxFeePerGas,
    setMaxPriorityFeePerGas,
    setGasLimit,
    setStorageLimit,
    setNonce,
    setSendAmount,
    setGasLevel,
    clearSendTransactionParams,
    clearAdvancedGasSetting,
    tx: txParams,
    txContext,
  } = useCurrentTxParams()
  const {setLoading} = useLoading()

  const {
    data: {
      value: currentAddressValue,
      nativeBalance,
      network: {eid: networkDbId, ticker, chainId},
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

  const isLegacyMax = maxStrategy === MAX_STRATEGY.LEGACY
  const isDeferredMax = maxStrategy === MAX_STRATEGY.DEFERRED

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
    nonce: formatDecimalToHex(nonce),
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
  const estimateRst =
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
  const tokenPayGas = useTokenPayGas({
    isHwAccount,
    networkDbId: isDapp ? dappApp?.currentNetwork?.eid : networkDbId,
    accountId: isDapp ? dappApp?.currentAccount?.eid : accountId,
    params: inputParams,
    gasLevel,
    estimateRst,
  })

  const nativeMaxDrip = estimateRst.nativeMaxDrip

  useEffect(() => {
    const nativeMax = convertDataToValue(nativeMaxDrip, nativeToken?.decimals)

    if (
      isLegacyMax &&
      isNativeToken &&
      !gasTokenAddress &&
      !tokenPayGas.isTokenPayGas &&
      nativeMax &&
      sendAmount !== nativeMax
    ) {
      setSendAmount(nativeMax)
    }
  }, [
    gasTokenAddress,
    isLegacyMax,
    isNativeToken,
    nativeMaxDrip,
    nativeToken?.decimals,
    sendAmount,
    setSendAmount,
    tokenPayGas.isTokenPayGas,
  ])

  const adjustedSendTx = useAdjustedSendTx({
    enabled: !isDapp && isDeferredMax && isSendToken,
    input: {
      amount: displayValue,
      amountHex: inputAmountHex,
      params: inputParams,
      recipientAddress: displayToAddress,
    },
    asset: {
      isNative: isNativeToken,
      address: displayTokenAddress,
      decimals: isNativeToken ? nativeToken?.decimals : displayToken?.decimals,
    },
    gasPayment: {
      isTokenPay: tokenPayGas.isTokenPayGas,
      tokenAddress: tokenPayGas.selectedGasToken?.address,
      nativeCostHex: tokenPayGas.nativeGasFee,
      tokenCostHex: tokenPayGas.tokenPayQuote?.tokenCost,
    },
  })

  const sendParams = [adjustedSendTx.params]
  const needsAdjustedEstimate = adjustedSendTx.isGasCostDeducted
  const adjustedEstimateRst =
    useEstimateTx(
      needsAdjustedEstimate ? adjustedSendTx.params : {},
      needsAdjustedEstimate && !isNativeToken && isSendToken
        ? {
            [displayTokenAddress]: adjustedSendTx.amountHex,
          }
        : {},
    ) || {}
  const sendEstimateRst = needsAdjustedEstimate
    ? adjustedEstimateRst
    : estimateRst
  const sendTokenValue =
    isSendToken && !isNativeToken && Object.keys(displayToken || {}).length
      ? adjustedSendTx.amountHex
      : '0x0'

  useEffect(() => {
    if (tokenPayGas.isTokenPayGas && gasLevel === 'advanced') {
      clearAdvancedGasSetting()
      setGasLevel('medium')
    }
  }, [
    tokenPayGas.isTokenPayGas,
    gasLevel,
    clearAdvancedGasSetting,
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
  const errorMessage = useEstimateError(
    sendEstimateRst,
    displayTokenAddress,
    !displayTokenAddress,
    isSendToken,
    {
      ignoreGasBalanceError:
        tokenPayGas.isTokenPayGas &&
        (!isNativeToken ||
          bn16(nativeBalance || '0x0').gte(
            bn16(adjustedSendTx.params.value || '0x0'),
          )),
    },
  )

  const adjustedAmountError =
    isDeferredMax && isSendToken && !adjustedSendTx.hasRemainingAmount
      ? t('gasFeeIsNotEnough')
      : ''

  const tokenPayQuoteErrorMessage =
    tokenPayGas.isTokenPayGas && tokenPayGas.tokenPayQuoteError
      ? t('gasFeeIsNotEnough')
      : ''
  useEffect(() => {
    setEstimateError(
      adjustedAmountError || tokenPayQuoteErrorMessage || errorMessage,
    )
  }, [adjustedAmountError, errorMessage, tokenPayQuoteErrorMessage])

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
      !nonce && setNonce(formatHexToDecimal(initNonce || rpcNonce || ''))
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
    setNonce,
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
    nonce,
  ])

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
      } else if (!isAppOpen) {
        setIsAppOpen(isAppOpen)
        return
      }
    }
    if (!isHwAccount) setLoading(true)
    else setSendStatus(TX_STATUS.HW_WAITING)

    if (tokenPayGas.isTokenPayGas && !tokenPayGas.tokenPayReady) {
      setLoading(false)
      return
    }

    const error = tokenPayGas.isTokenPayGas
      ? await tokenPayGas.checkTokenPayBalance({
          submitTx: adjustedSendTx.params,
          displayToken,
          isNativeToken,
          isSendToken,
          sendTokenValue,
        })
      : await checkBalance(
          adjustedSendTx.params,
          displayToken,
          isNativeToken,
          isSendToken,
          sendTokenValue,
          networkTypeIsCfx,
          uses1559Fees,
        )
    if (error) {
      setLoading(false)
      setEstimateError(t(error))
      return
    }

    if (tokenPayGas.isTokenPayGas) {
      tokenPayGas
        .submitTokenPayTransaction({
          submitTx: adjustedSendTx.params,
          maxTokenCost: tokenPayGas.tokenPayQuote?.tokenCost,
        })
        .then(() => {
          setLoading(false)
          setTimeout(() => clearSendTransactionParams(), 500)
          history.push(HOME)
        })
        .catch(error => {
          console.error('error', error)
          setLoading(false)
          setSendStatus(TX_STATUS.ERROR)
          setSendError(error)
        })
      return
    }

    request(SEND_TRANSACTION, [adjustedSendTx.params])
      .then(() => {
        if (!isHwAccount) setLoading(false)
        else setSendStatus(TX_STATUS.HW_SUCCESS)
        setTimeout(() => clearSendTransactionParams(), 500)
        history.push(HOME)
      })
      .catch(error => {
        console.error('error', error)
        if (!isHwAccount) setLoading(false)
        setSendStatus(TX_STATUS.ERROR)
        setSendError(error)
      })
  }

  const onCloseTransactionResult = () => {
    clearSendTransactionParams()
    if (!isDapp) history.push(HOME)
    else window.close()
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
    !!estimateError ||
    sendEstimateRst.loading ||
    Object.keys(sendEstimateRst).length === 0 ||
    (tokenPayGas.isTokenPayGas &&
      (tokenPayGas.tokenPayQuoteLoading ||
        tokenPayGas.tokenPayQuoteError ||
        !tokenPayGas.tokenPayReady)) ||
    (customAllowance && isDecoding)

  const dappConfirmParams =
    isDapp && tokenPayGas.isTokenPayGas
      ? {
          tx: sendParams,
          tokenPay: {
            gasTokenAddress: tokenPayGas.selectedGasToken.address,
            gasLevel: tokenPayGas.tokenPayGasLevel,
            maxTokenCost: tokenPayGas.tokenPayQuote?.tokenCost,
          },
        }
      : {tx: sendParams}
  const beforeDappConfirm = async () => {
    if (!tokenPayGas.isTokenPayGas) return

    const error = await tokenPayGas.checkTokenPayBalance({
      submitTx: adjustedSendTx.params,
      displayToken,
      isNativeToken,
      isSendToken,
      sendTokenValue,
    })

    if (error) {
      setEstimateError(t(error))
      return false
    }

    return true
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
            clearAdvancedGasSetting()
            setGasLevel('medium')
            setGasTokenAddress('')
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
            value={adjustedSendTx.amount}
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
            allowance={adjustedSendTx.amount}
            value={adjustedSendTx.params.value}
            pendingAuthReq={pendingAuthReq}
            decimals={nativeToken?.decimals}
            symbol={nativeToken?.symbol}
          />
          <ConfirmGasFee
            isDapp={isDapp}
            isHwAccount={isHwAccount}
            tokenPayGas={tokenPayGas}
            nativeToken={nativeToken}
            nativeBalance={nativeBalance}
            accountAddress={currentAddressValue}
            networkDbId={networkDbId}
            estimateRst={sendEstimateRst}
            uses1559Fees={uses1559Fees}
            isDeferredMax={isDeferredMax}
            sendTokenAddress={displayTokenAddress}
            sendTokenAmount={inputAmountHex}
          />
        </div>
        <div className="flex flex-col items-center">
          {isDapp && !!inputParams.data && inputParams.data !== '0x' && (
            <Link onClick={() => history.push(VIEW_DATA)} className="mb-6">
              {t('viewData')}
              <RightOutlined className="w-3 h-3 text-primary ml-1" />
            </Link>
          )}

          {!isDapp && !isSwitchInfoDrawerOpen && (
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
              beforeConfirm={beforeDappConfirm}
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
    </div>
  )
}

export default ConfirmTransaction
