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
  useIsTxTreatedAsEIP1559,
  useQuery,
} from '../../hooks'
import {formatStatus, request, checkBalance} from '../../utils'
import {TransactionResult, AlertMessage} from '../../components'
import {ExecutedTransaction} from './components'

import {RPC_METHODS, TX_STATUS} from '../../constants'

const {WALLET_SEND_TRANSACTION_WITH_ACTION} = RPC_METHODS

const filterNonValueParams = (originParams = {}, otherParams = {}) => {
  const ret = {}
  originParams = {...originParams, ...otherParams}
  Object.keys(originParams)
    .filter(_k => !!originParams[_k])
    .forEach(k => {
      ret[k] = originParams[k]
    })
  return ret
}
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

  const {
    data,
    from,
    to,
    nonce,
    value,
    gasPrice,
    maxFeePerGas,
    type: eipVersionType,
  } = txPayload
  const reSendTxStatus = formatStatus(status)

  const isTxTreatedAsEIP1559 = useIsTxTreatedAsEIP1559(eipVersionType)

  const lastGasPrice = isTxTreatedAsEIP1559 ? maxFeePerGas : gasPrice

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

  const originParams = filterNonValueParams(
    resendType === 'speedup'
      ? {
          type: eipVersionType,
          from,
          to,
          nonce,
          value,
          data,
        }
      : {
          type: eipVersionType,
          from,
          to: from,
          nonce,
          value: '0x0',
        },
  )

  const originEstimateRst =
    useEstimateTx({...originParams}, token20Params) || {}

  const {
    gasPrice: estimateGasPrice,
    gasInfoEip1559 = {},
    loading,
  } = originEstimateRst

  const originEstimateGasPrice = useMemo(() => {
    if (
      loading ||
      (!isTxTreatedAsEIP1559 && !estimateGasPrice) ||
      (isTxTreatedAsEIP1559 && !gasInfoEip1559?.['medium'])
    )
      return null
    return !isTxTreatedAsEIP1559
      ? estimateGasPrice
      : convertDecimal(
          new Big(gasInfoEip1559?.['medium']?.suggestedMaxFeePerGas)
            .round(9)
            .toString(10),
          'multiply',
          GWEI_DECIMALS,
        )
  }, [isTxTreatedAsEIP1559, estimateGasPrice, gasInfoEip1559, loading])

  const resendTransaction = async params => {
    try {
      await request(WALLET_SEND_TRANSACTION_WITH_ACTION, {
        action:
          resendType === 'expeditedCancellation' || resendType === 'cancel'
            ? 'cancel'
            : 'speedup',
        tx: [params],
      })
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
    if (loading || !accountType) {
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

    const params = filterNonValueParams({...originParams}, {...feeParams})
    const error = await checkBalance(
      params,
      token || {},
      resendType === 'speedup' ? simple : true,
      resendType === 'speedup' ? isSendingToken || simple : true,
      sendTokenValue,
      networkTypeIsCfx,
      isTxTreatedAsEIP1559,
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
    if (lastGasPrice && originEstimateGasPrice) {
      const decimalGasPrice = formatHexToDecimal(lastGasPrice)
      const decimalEstimateGasPrice = formatHexToDecimal(originEstimateGasPrice)

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
  }, [originEstimateGasPrice, lastGasPrice])

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
        tx={{...originParams}}
        resendDisabled={!!estimateError}
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
