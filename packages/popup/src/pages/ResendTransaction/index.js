import {useState, useEffect, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {
  Big,
  formatDecimalToHex,
  formatHexToDecimal,
  convertDecimal,
  GWEI_DECIMALS,
} from '@fluent-wallet/data-format'
import EditGasFee from '../EditGasFee'
import {
  useSingleTx,
  useNetworkTypeIsCfx,
  useCurrentAddress,
} from '../../hooks/useApi'
import useLoading from '../../hooks/useLoading'
import {
  useEstimateTx,
  useDecodeData,
  useCurrentTxStore,
  useLedgerBindingApi,
  useUses1559Fees,
  useQuery,
} from '../../hooks'
import {formatStatus, request, checkBalance} from '../../utils'
import {TransactionResult, AlertMessage} from '../../components'
import {ExecutedTransaction} from './components'

import {RPC_METHODS, TX_STATUS} from '../../constants'

import {buildResendTxParams, omitFalsyTxParams} from './resendParams'

const {WALLET_SEND_TRANSACTION_WITH_ACTION} = RPC_METHODS
function ResendTransaction() {
  const history = useHistory()
  const {t} = useTranslation()
  const query = useQuery()
  const ledgerBindingApi = useLedgerBindingApi()
  const {setLoading} = useLoading()

  const {clearSendTransactionParams} = useCurrentTxStore()

  const [suggestedGasPrice, setSuggestedGasPrice] = useState('')
  const [estimateError, setEstimateError] = useState('')
  const [sendError, setSendError] = useState({})
  const [executedTxResultStatus, setExecutedTxResultStatus] = useState(false)
  const [sendStatus, setSendStatus] = useState('')
  const [authStatus, setAuthStatus] = useState(true)
  const [isAppOpen, setIsAppOpen] = useState(true)

  const {
    data: {account},
  } = useCurrentAddress()
  const networkTypeIsCfx = useNetworkTypeIsCfx()

  const accountType = account?.accountGroup?.vault?.type
  const isHwAccount = accountType === 'hw'
  const isHwUnAuth = !authStatus && isHwAccount
  const isHwOpenAlert = authStatus && !isAppOpen && isHwAccount

  // 1.speedup: speedup current transactions
  // 2.cancel: cancel current transaction
  // 3.expeditedCancellation: speedup a transaction that has already been cancelled

  const resendType = query.get('type')
  const hash = query.get('hash')

  const {
    data: {txPayload = {}, token, txExtra = {}, status},
  } = useSingleTx(hash)

  const {simple, token20} = txExtra

  const {data, to, gasPrice, maxFeePerGas} = txPayload
  const reSendTxStatus = formatStatus(status)
  const {txParams: resendTxParams} = buildResendTxParams({
    resendType,
    txPayload,
  })
  const resendParamsInvalid =
    Object.keys(txPayload).length > 0 && !Object.keys(resendTxParams).length

  const uses1559Fees = useUses1559Fees(resendTxParams?.type)

  const lastGasPrice = uses1559Fees ? maxFeePerGas : gasPrice

  // decode erc20 data
  const {decodeData} = useDecodeData(
    resendType === 'speedup'
      ? {
          to,
          data,
        }
      : {},
  )

  const isSendingToken =
    resendType === 'speedup' &&
    token20 &&
    token &&
    (decodeData?.name === 'transfer' || decodeData?.name === 'transferFrom')

  const sendTokenValue = isSendingToken
    ? decodeData.name === 'transfer'
      ? decodeData.args[1]._hex
      : decodeData.args[2]._hex
    : '0x0'

  const token20Params = isSendingToken
    ? {
        [token.address]: sendTokenValue,
      }
    : {}

  const resendEstimateRst =
    useEstimateTx({...resendTxParams}, token20Params) || {}

  const {
    gasPrice: estimateGasPrice,
    gasInfoEip1559 = {},
    loading,
  } = resendEstimateRst

  const resendEstimateGasPrice = useMemo(() => {
    if (
      loading ||
      (!uses1559Fees && !estimateGasPrice) ||
      (uses1559Fees && !gasInfoEip1559?.['medium'])
    )
      return null
    return !uses1559Fees
      ? estimateGasPrice
      : convertDecimal(
          new Big(gasInfoEip1559?.['medium']?.suggestedMaxFeePerGas)
            .round(9)
            .toString(10),
          'multiply',
          GWEI_DECIMALS,
        )
  }, [uses1559Fees, estimateGasPrice, gasInfoEip1559, loading])

  const resendTransaction = async txParams => {
    const action =
      resendType === 'expeditedCancellation' || resendType === 'cancel'
        ? 'cancel'
        : 'speedup'

    const gasParams = omitFalsyTxParams({
      gas: txParams.gas,
      gasPrice: txParams.gasPrice,
      storageLimit: txParams.storageLimit,
      maxFeePerGas: txParams.maxFeePerGas,
      maxPriorityFeePerGas: txParams.maxPriorityFeePerGas,
    })

    const requestParams = {
      action,
      originalTxHash: hash,
      ...gasParams,
    }

    try {
      await request(WALLET_SEND_TRANSACTION_WITH_ACTION, requestParams)
      clearSendTransactionParams()
      history.goBack()
    } catch (error) {
      if (reSendTxStatus !== 'pending') {
        return
      }
      if (error?.data?.includes?.('too stale nonce')) {
        clearSendTransactionParams()
        history.goBack()
        return
      }
      setSendStatus(TX_STATUS.ERROR)
      setSendError(error)
    }
  }

  const onResend = async feeParams => {
    if (loading || !accountType || resendParamsInvalid) {
      return
    }

    if (isHwAccount) {
      if (!ledgerBindingApi) {
        return
      }

      const authStatus = await ledgerBindingApi.isDeviceAuthed()
      const isAppOpen = await ledgerBindingApi.isAppOpen()

      if (!authStatus) {
        return setAuthStatus(authStatus)
      }
      if (!isAppOpen) {
        return setIsAppOpen(isAppOpen)
      }
      setSendStatus(TX_STATUS.HW_WAITING)
    } else {
      setLoading(true)
    }

    const params = omitFalsyTxParams(resendTxParams, feeParams)
    const error = await checkBalance(
      params,
      token || {},
      resendType === 'speedup' ? simple : true,
      resendType === 'speedup' ? isSendingToken || simple : true,
      sendTokenValue,
      networkTypeIsCfx,
      uses1559Fees,
    )

    if (error) {
      setLoading(false)
      setSendStatus('')
      setEstimateError(t(error))
      return
    }

    await resendTransaction(params)
    setLoading(false)
  }

  const onCloseTransactionResult = () => {
    setSendStatus('')
    setSendError({})
  }

  // set default gas price (legacy tx)
  useEffect(() => {
    if (lastGasPrice && resendEstimateGasPrice) {
      const decimalGasPrice = formatHexToDecimal(lastGasPrice)
      const decimalEstimateGasPrice = formatHexToDecimal(resendEstimateGasPrice)

      const biggerGasPrice = new Big(decimalGasPrice).times(1.1)

      const recommendGasPrice = (
        new Big(biggerGasPrice).gt(decimalEstimateGasPrice)
          ? biggerGasPrice
          : new Big(decimalEstimateGasPrice)
      )
        .round(0, 3)
        .toString(10)

      setSuggestedGasPrice(formatDecimalToHex(recommendGasPrice))
    }
  }, [resendEstimateGasPrice, lastGasPrice])

  //cancel resend tx when tx status is not pending
  useEffect(() => {
    if (reSendTxStatus && reSendTxStatus !== 'pending') {
      setExecutedTxResultStatus(true)
      setLoading(false)
    }
  }, [reSendTxStatus, setLoading])

  if (!Object.keys(txPayload).length || !resendType) {
    return null
  }

  return (
    <div className="relative h-full">
      <EditGasFee
        resendGasPrice={suggestedGasPrice}
        resendType={resendType}
        onSubmit={onResend}
        tx={{...resendTxParams}}
        resendDisabled={resendParamsInvalid || !!estimateError}
        onClickGasStationItem={() => setEstimateError('')}
      />
      {sendStatus && (
        <TransactionResult
          status={sendStatus}
          sendError={sendError}
          onClose={onCloseTransactionResult}
        />
      )}
      <AlertMessage
        isDapp={false}
        isHwUnAuth={isHwUnAuth}
        isHwOpenAlert={isHwOpenAlert}
        estimateError={estimateError}
      />
      {executedTxResultStatus && (
        <ExecutedTransaction
          open={executedTxResultStatus}
          onClose={() => {
            clearSendTransactionParams()
            history.goBack()
          }}
        />
      )}
    </div>
  )
}

export default ResendTransaction
