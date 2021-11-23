import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Link from '@fluent-wallet/component-link'
import Button from '@fluent-wallet/component-button'
import {RightOutlined} from '@fluent-wallet/component-icons'
import {
  formatDecimalToHex,
  convertValueToData,
} from '@fluent-wallet/data-format'
import useGlobalStore from '../../stores'
import {
  useTxParams,
  useEstimateTx,
  useCheckBalanceAndGas,
  useDecodeData,
  useDecodeDisplay,
  useDappParams,
  useViewData,
} from '../../hooks'
import {
  useCurrentNativeToken,
  usePendingAuthReq,
  useNetworkTypeIsCfx,
} from '../../hooks/useApi'
import {request} from '../../utils'
import {AddressCard, InfoList, TransactionResult} from './components'
import {TitleNav, GasFee, DappFooter} from '../../components'
import {ROUTES, RPC_METHODS} from '../../constants'
const {VIEW_DATA, HOME} = ROUTES
const {CFX_SEND_TRANSACTION, ETH_SEND_TRANSACTION} = RPC_METHODS

function ConfirmTransition() {
  const {t} = useTranslation()
  const history = useHistory()
  const [showResult, setShowResult] = useState(false)
  const [sendingTransaction, setSendingTransaction] = useState(false)
  const [balanceError, setBalanceError] = useState('')
  const [hash, setHash] = useState('')
  const pendingAuthReq = usePendingAuthReq()
  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const SEND_TRANSACTION = networkTypeIsCfx
    ? CFX_SEND_TRANSACTION
    : ETH_SEND_TRANSACTION
  const {
    gasPrice,
    gasLimit,
    nonce,
    setGasPrice,
    setGasLimit,
    setNonce,
    clearSendTransactionParams,
  } = useGlobalStore()

  const nativeToken = useCurrentNativeToken()
  const tx = useDappParams()
  const isDapp = pendingAuthReq?.length > 0
  // get to type and to token
  const {isContract, decodeData} = useDecodeData(tx)
  const {
    isApproveToken,
    isSendToken,
    displayToken,
    displayValue,
    displayToAddress,
  } = useDecodeDisplay({isDapp, isContract, nativeToken, tx})
  const isSign = !isSendToken && !isApproveToken
  const txParams = useTxParams()
  const originParams = !isDapp ? {...txParams} : {...tx}
  const params = {
    ...originParams,
    gasPrice: formatDecimalToHex(gasPrice),
    gas: formatDecimalToHex(gasLimit),
    nonce: formatDecimalToHex(nonce),
  }
  const viewData = useViewData(params)
  params.data = viewData
  const sendParams = []
  sendParams.push(params)
  const isNativeToken = !displayToken?.address
  const estimateRst =
    useEstimateTx(
      params,
      !isNativeToken && isSendToken
        ? {
            [displayToken?.address]: convertValueToData(
              displayValue,
              displayToken?.decimals,
            ),
          }
        : {},
    ) || {}

  const errorMessage = useCheckBalanceAndGas(
    estimateRst,
    displayValue,
    isSendToken,
  )
  useEffect(() => {
    setBalanceError(errorMessage)
  }, [errorMessage])

  useEffect(() => {
    if (isDapp) {
      tx.gas && setGasLimit(tx.gas)
      tx.gasPrice && setGasPrice(tx.gasPrice)
      tx.nonce && setNonce(tx.nonce)
    }
  }, [
    isDapp,
    tx.gas,
    tx.nonce,
    tx.gasPrice,
    setGasPrice,
    setNonce,
    setGasLimit,
  ])

  const onSend = () => {
    if (sendingTransaction) return
    setSendingTransaction(true)
    request(SEND_TRANSACTION, [params])
      .then(result => {
        setSendingTransaction(false)
        setHash(result)
        setShowResult(true)
      })
      .catch(error => {
        setSendingTransaction(false)
        console.error('error', error?.message ?? error)
      })
  }

  return (
    <div className="flex flex-col h-full relative">
      <TitleNav title={t('signTransaction')} hasGoBack={!isDapp} />
      <div className="flex flex-1 flex-col justify-between mt-1 pb-4">
        <div className="flex flex-col px-3">
          <AddressCard
            token={displayToken}
            toAddress={displayToAddress}
            value={displayValue}
            isSendToken={isSendToken}
            isApproveToken={isApproveToken}
            isDapp={isDapp}
          />
          <InfoList
            token={displayToken}
            isApproveToken={isApproveToken}
            isDapp={isDapp}
            isSign={isSign}
            method={decodeData?.name || 'Unknown'}
            allowance={displayValue}
            pendingAuthReq={pendingAuthReq}
          />
          <GasFee estimateRst={estimateRst} isDapp={isDapp} />
          <span className="text-error text-xs inline-block mt-2">
            {balanceError}
          </span>
        </div>
        <div className="flex flex-col items-center">
          {isDapp && (
            <Link onClick={() => history.push(VIEW_DATA)} className="mb-6">
              {t('viewData')}
              <RightOutlined className="w-3 h-3 text-primary ml-1" />
            </Link>
          )}
          {!isDapp && (
            <div className="w-full flex px-4">
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
                disabled={!!balanceError}
              >
                {t('confirm')}
              </Button>
            </div>
          )}
          {isDapp && (
            <DappFooter
              confirmText={t('confirm')}
              cancelText={t('cancel')}
              confirmDisabled={!!balanceError}
              onClickConfirm={() => setShowResult(true)}
              confirmParams={{tx: sendParams}}
            />
          )}
        </div>
      </div>
      {showResult && <TransactionResult transactionHash={hash} />}
    </div>
  )
}

export default ConfirmTransition
