import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Link from '@fluent-wallet/component-link'
import Button from '@fluent-wallet/component-button'
import {RightOutlined} from '@fluent-wallet/component-icons'
import {
  formatDecimalToHex,
  formatHexToDecimal,
  convertValueToData,
  convertDataToValue,
} from '@fluent-wallet/data-format'
import {
  useCurrentTxParams,
  useEstimateTx,
  useEstimateError,
  useDecodeData,
  useDecodeDisplay,
  useDappParams,
  useViewData,
  useLedgerBindingApi,
  useIsTxTreatedAsEIP1559,
} from '../../hooks'
import {useCurrentAddress, useNetworkTypeIsCfx} from '../../hooks/useApi'
import {useConnect} from '../../hooks/useLedger'
import {
  request,
  getPageType,
  checkBalance,
  transformToTitleCase,
} from '../../utils'
import {AddressCard, InfoList} from './components'
import {
  TitleNav,
  GasFee,
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

const {VIEW_DATA, HOME} = ROUTES
const {
  CFX_SEND_TRANSACTION,
  ETH_SEND_TRANSACTION,
  WALLET_GET_PENDING_AUTH_REQUEST,
} = RPC_METHODS

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
    maxMode,
    sendAmount,
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
  } = useCurrentTxParams()
  const {setLoading} = useLoading()

  const {
    data: {
      network: {ticker, chainId},
      account: {eid: accountId},
    },
  } = useCurrentAddress()

  const nativeToken = ticker || {}
  const tx = useDappParams(pendingAuthReq)

  // get to type and to token
  const {isContract, decodeData, isEOAAddress} = useDecodeData(tx)
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
    tx,
    pendingAuthReq: pendingAuthReq?.[0],
  })
  const isSign = !isSendToken && !isApproveToken

  const type = displayAccount?.accountGroup?.vault?.type
  const isHwAccount = type === 'hw' && type !== undefined
  const isHwUnAuth = !authStatus && isHwAccount
  const isHwOpenAlert = authStatus && !isAppOpen && isHwAccount

  // params in wallet send or dapp send
  const originParams = !isDapp ? {...txParams} : {...tx}

  const isTxTreatedAsEIP1559 = useIsTxTreatedAsEIP1559(originParams?.type)

  // dapp send params
  const {
    gasPrice: initGasPrice,
    maxFeePerGas: initMaxFeePerGas,
    maxPriorityFeePerGas: initMaxPriorityFeePerGas,
    gas: initGasLimit,
    nonce: initNonce,
    storageLimit: initStorageLimit,
  } = tx
  // user can edit nonce, gasPrice and gas
  const params = {
    ...originParams,
    gasPrice: formatDecimalToHex(gasPrice),
    maxFeePerGas: formatDecimalToHex(maxFeePerGas),
    maxPriorityFeePerGas: formatDecimalToHex(maxPriorityFeePerGas),
    gas: formatDecimalToHex(gasLimit),
    nonce: formatDecimalToHex(nonce),
    storageLimit: formatDecimalToHex(storageLimit),
  }

  // user can edit the approve limit
  const viewData = useViewData(params, isApproveToken)
  params.data = viewData

  // send params, need to delete '' or undefined params,
  // otherwise cfx_sendTransaction will return params error
  if (!params.gasPrice) delete params.gasPrice
  if (!params.maxFeePerGas) delete params.maxFeePerGas
  if (!params.maxPriorityFeePerGas) delete params.maxPriorityFeePerGas
  if (!params.nonce) delete params.nonce
  if (!params.gas) delete params.gas
  if (!params.storageLimit) delete params.storageLimit
  if (!params.data) delete params.data
  const sendParams = [params]

  const {address: displayTokenAddress} = displayToken || {}

  const isNativeToken = !displayTokenAddress
  const estimateRst =
    useEstimateTx(
      params,
      !isNativeToken && isSendToken
        ? {
            [displayTokenAddress]: convertValueToData(
              displayValue,
              displayToken?.decimals,
            ),
          }
        : {},
    ) || {}

  const {nativeMaxDrip} = estimateRst

  useEffect(() => {
    const nativeMax = convertDataToValue(nativeMaxDrip, nativeToken?.decimals)
    if (maxMode && isNativeToken && sendAmount !== nativeMax && !!nativeMax) {
      setSendAmount(nativeMax)
    }
  }, [
    maxMode,
    isNativeToken,
    sendAmount,
    setSendAmount,
    nativeMaxDrip,
    nativeToken?.decimals,
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
    estimateRst,
    displayTokenAddress,
    !displayTokenAddress,
    isSendToken,
  )

  useEffect(() => {
    setEstimateError(errorMessage)
  }, [errorMessage])
  // when dapp send, init the gas edit global store
  useEffect(() => {
    if (isDapp) {
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

    const sendTokenValue =
      isSendToken && !isNativeToken && Object.keys(displayToken).length
        ? convertValueToData(displayValue, displayToken.decimals)
        : '0x0'

    const error = await checkBalance(
      params,
      displayToken,
      isNativeToken,
      isSendToken,
      sendTokenValue,
      networkTypeIsCfx,
      isTxTreatedAsEIP1559,
    )
    if (error) {
      setLoading(false)
      setEstimateError(t(error))
      return
    }

    request(SEND_TRANSACTION, [params])
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

  const confirmDisabled =
    !!estimateError ||
    estimateRst.loading ||
    Object.keys(estimateRst).length === 0

  return (
    <div className="confirm-transaction-container flex flex-col h-full w-full relative">
      <header>
        <TitleNav
          title={t('signTransaction')}
          hasGoBack={!isDapp}
          onGoBack={() => {
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
            fromAddress={displayFromAddress}
            toAddress={displayToAddress}
            value={displayValue}
            isSendToken={isSendToken}
            isApproveToken={isApproveToken}
          />
          <InfoList
            token={displayToken}
            isApproveToken={isApproveToken}
            isDapp={isDapp}
            isSign={isSign}
            method={
              decodeData?.name ? transformToTitleCase(decodeData.name) : ''
            }
            allowance={displayValue}
            value={params.value}
            pendingAuthReq={pendingAuthReq}
            decimals={nativeToken?.decimals}
            symbol={nativeToken?.symbol}
          />
          <GasFee
            estimateRst={estimateRst}
            isTxTreatedAsEIP1559={isTxTreatedAsEIP1559}
          />
        </div>
        <div className="flex flex-col items-center">
          {!!params.data && params.data !== '0x' && (
            <Link onClick={() => history.push(VIEW_DATA)} className="mb-6">
              {t('viewData')}
              <RightOutlined className="w-3 h-3 text-primary ml-1" />
            </Link>
          )}

          {!isDapp && (
            <div className="w-full flex px-3 z-50">
              <Button
                variant="outlined"
                className="flex-1 mr-3"
                onClick={() => {
                  clearSendTransactionParams()
                  history.push(HOME)
                }}
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
              confirmParams={{tx: sendParams}}
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
    </div>
  )
}

export default ConfirmTransaction
