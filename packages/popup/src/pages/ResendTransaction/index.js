import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {
  Big,
  formatDecimalToHex,
  formatHexToDecimal,
} from '@fluent-wallet/data-format'
import EditGasFee from '../EditGasFee'
import useGlobalStore from '../../stores'
import {
  useSingleTx,
  useNetworkTypeIsCfx,
  useCurrentAddress,
} from '../../hooks/useApi'
import useLoading from '../../hooks/useLoading'
import {
  useEstimateTx,
  useDecodeData,
  useEstimateError,
  useCurrentTxParams,
  useLedgerBindingApi,
  useIsTxTreatedAsEIP1559,
} from '../../hooks'
import {formatStatus, request, checkBalance} from '../../utils'
import {TransactionResult} from '../../components'
import {ExecutedTransaction} from './components'
import {AlertMessage} from '../ConfirmTransaction/components'

import {RPC_METHODS, TX_STATUS} from '../../constants'

const {CFX_SEND_TRANSACTION, ETH_SEND_TRANSACTION} = RPC_METHODS

const getSendTxParams = (
  originParams = {},
  otherParams = {},
  estimate = {},
) => {
  let ret = {}
  for (let k in otherParams) {
    originParams[k] = otherParams[k] || estimate[k]
  }
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
  const ledgerBindingApi = useLedgerBindingApi()
  const {setLoading} = useLoading()

  const {setResendInfo, resendInfo} = useGlobalStore()
  const {
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasLimit,
    clearSendTransactionParams,
  } = useCurrentTxParams()

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
  const SEND_TRANSACTION = networkTypeIsCfx
    ? CFX_SEND_TRANSACTION
    : ETH_SEND_TRANSACTION

  const {type: resendType, hash} = resendInfo
  const isSpeedup = resendType === 'speedup'

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
    gasPrice: lastGasPrice,
    type: eipVersionType,
  } = txPayload
  const reSendTxStatus = formatStatus(status)

  const isTxTreatedAsEIP1559 = useIsTxTreatedAsEIP1559(eipVersionType)

  // decode erc20 data
  const {decodeData} = useDecodeData(
    isSpeedup
      ? {
          to,
          data,
        }
      : {},
  )

  const isSendingToken =
    isSpeedup &&
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

  const originParams = isSpeedup
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
      }

  const originEstimateRst = useEstimateTx(originParams, token20Params) || {}

  console.log('originEstimateRst', originEstimateRst)
  const estimateRst =
    useEstimateTx(
      getSendTxParams(
        {
          ...originParams,
        },
        {
          gasPrice: formatDecimalToHex(gasPrice),
          maxFeePerGas: formatDecimalToHex(maxFeePerGas),
          maxPriorityFeePerGas: formatDecimalToHex(maxPriorityFeePerGas),
          gas: formatDecimalToHex(gasLimit),
        },
        {...originEstimateRst},
      ),
      token20Params,
    ) || {}

  console.log('estimateRst', estimateRst)

  // check balance
  const errorMessage = useEstimateError(
    estimateRst,
    isSendingToken ? to : null,
    isSpeedup ? simple : true,
    isSpeedup ? isSendingToken || simple : true,
  )
  const isContractError = estimateError.indexOf(t('contractError')) !== -1

  console.log('errorMessage', errorMessage)

  const resendTransaction = params => {
    request(SEND_TRANSACTION, [params])
      .then(() => {
        setLoading(false)
        if (!isHwAccount) {
          history.goBack()
          return
        }
        setSendStatus(TX_STATUS.HW_SUCCESS)
      })
      .catch(error => {
        setLoading(false)
        if (reSendTxStatus !== 'pending') {
          return
        }
        if (error?.data?.includes?.('too stale nonce')) {
          history.goBack()
          return
        }
        setSendStatus(TX_STATUS.ERROR)
        setSendError(error)
      })
  }

  // feeParams contains: gasPrice maxFeePerGas maxPriorityFeePerGas gas storageLimit
  const onResend = async feeParams => {
    if (estimateRst?.loading || !accountType) {
      return
    }

    if (isHwAccount) {
      if (!ledgerBindingApi) {
        return
      }

      const authStatus = await ledgerBindingApi.isDeviceAuthed()
      const isAppOpen = await ledgerBindingApi.isAppOpen()

      if (!ledgerBindingApi) {
        return
      }
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

    const params = {...originParams, ...feeParams}

    const error = await checkBalance(
      params,
      token || {},
      isSpeedup ? simple : true,
      isSpeedup ? isSendingToken || simple : true,
      sendTokenValue,
      networkTypeIsCfx,
      isTxTreatedAsEIP1559,
    )

    if (error) {
      setLoading(false)
      setEstimateError(error)
      setSendStatus('')
      return
    }

    resendTransaction(params)
  }

  const onCloseTransactionResult = () => {
    setSendStatus('')
    setSendError({})
  }

  useEffect(() => {
    if (!estimateRst?.loading) {
      setEstimateError(errorMessage)
    }
  }, [errorMessage, estimateRst?.loading])

  // set default gas price (legacy tx)
  useEffect(() => {
    if (lastGasPrice && originEstimateRst?.gasPrice) {
      const decimalGasPrice = formatHexToDecimal(lastGasPrice)
      const decimalEstimateGasPrice = formatHexToDecimal(
        originEstimateRst.gasPrice,
      )

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
  }, [originEstimateRst.gasPrice, lastGasPrice])

  //cancel resend tx when tx status is not pending
  useEffect(() => {
    if (reSendTxStatus && reSendTxStatus !== 'pending') {
      setExecutedTxResultStatus(true)
      setLoading(false)
    }
  }, [reSendTxStatus, setLoading])

  useEffect(() => {
    return () => {
      clearSendTransactionParams()
      setResendInfo({})
    }
  }, [setResendInfo, clearSendTransactionParams])

  if (!Object.keys(txPayload).length || !resendType || !hash) {
    return null
  }

  return (
    <>
      <EditGasFee
        resendGasPrice={suggestedGasPrice}
        isSpeedUp={isSpeedup}
        onSubmit={onResend}
        tx={{...originParams}}
        disabled={!!estimateError}
      />
      {(isHwAccount || sendStatus === TX_STATUS.ERROR) && (
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
        isContractError={isContractError}
      />
      {executedTxResultStatus && (
        <ExecutedTransaction
          open={executedTxResultStatus}
          onClose={() => history.goBack()}
        />
      )}
    </>
  )
}

export default ResendTransaction
