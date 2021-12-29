import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {useRPC} from '@fluent-wallet/use-rpc'
import Link from '@fluent-wallet/component-link'
import Button from '@fluent-wallet/component-button'
import Alert from '@fluent-wallet/component-alert'
import {RightOutlined} from '@fluent-wallet/component-icons'
import {
  formatDecimalToHex,
  formatHexToDecimal,
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
  useCurrentAddress,
  usePendingAuthReq,
  useNetworkTypeIsCfx,
} from '../../hooks/useApi'
import {useConnect} from '../../hooks/useLedger'
import {request, bn16} from '../../utils'
import {AddressCard, InfoList, HwTransactionResult} from './components'
import {TitleNav, GasFee, DappFooter, HwAlert} from '../../components'
import {
  ROUTES,
  RPC_METHODS,
  LEDGER_AUTH_STATUS,
  HW_TX_STATUS,
} from '../../constants'
import useLoading from '../../hooks/useLoading'
import useDebouncedValue from '../../hooks/useDebouncedValue'

const {VIEW_DATA, HOME} = ROUTES
const {
  CFX_SEND_TRANSACTION,
  ETH_SEND_TRANSACTION,
  WALLET_GET_BALANCE,
  QUERY_ADDRESS,
} = RPC_METHODS

const useAddressTypeInConfirmTx = address => {
  const {
    data: {
      network: {eid: networkId},
    },
  } = useCurrentAddress()
  const {data} = useRPC(
    address && networkId
      ? [QUERY_ADDRESS, 'useAddressTypeInConfirmTx', address, networkId]
      : null,
    {
      value: address,
      networkId,
      g: {
        eid: 1,
        _account: {eid: 1, _accountGroup: {vault: {type: 1}}},
      },
    },
    {
      fallbackData: {
        account: {accountGroup: {vault: {}}},
      },
    },
  )
  return data
}

function ConfirmTransition() {
  const {t} = useTranslation()
  const history = useHistory()
  const {authStatus} = useConnect()
  const [sendStatus, setSendStatus] = useState()
  const [balanceError, setBalanceError] = useState('')
  const pendingAuthReq = usePendingAuthReq()
  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const SEND_TRANSACTION = networkTypeIsCfx
    ? CFX_SEND_TRANSACTION
    : ETH_SEND_TRANSACTION
  const {
    gasPrice,
    gasLimit,
    storageLimit,
    nonce,
    setGasPrice,
    setGasLimit,
    setStorageLimit,
    setNonce,
    clearSendTransactionParams,
  } = useGlobalStore()
  const {setLoading} = useLoading()

  const {
    data: {
      network: {ticker},
    },
  } = useCurrentAddress()
  const nativeToken = ticker || {}
  const tx = useDappParams()
  const isDapp = pendingAuthReq?.length > 0
  // get to type and to token
  const {isContract, decodeData} = useDecodeData(tx)
  const {
    isApproveToken,
    isSendToken,
    displayToken,
    displayValue,
    displayFromAddress,
    displayToAddress,
  } = useDecodeDisplay({isDapp, isContract, nativeToken, tx})
  const isSign = !isSendToken && !isApproveToken

  const {
    account: {
      accountGroup: {
        vault: {type},
      },
    },
  } = useAddressTypeInConfirmTx(displayFromAddress)
  const isHwAccount = type === 'hw'
  const isHwUnAuth = authStatus === LEDGER_AUTH_STATUS.UNAUTHED && isHwAccount
  const isHwOpenAlert =
    authStatus !== LEDGER_AUTH_STATUS.UNAUTHED && isHwAccount

  // params in wallet send or dapp send
  const txParams = useTxParams()
  const originParams = !isDapp ? {...txParams} : {...tx}
  // user can edit nonce, gasPrice and gas
  const {
    gasPrice: initGasPrice,
    gas: initGasLimit,
    nonce: initNonce,
    storageLimit: initStorageLimit,
  } = tx

  const params = {
    ...originParams,
    gasPrice: formatDecimalToHex(gasPrice),
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

  // only need to estimate gas not need to get whether balance is enough
  // so do not pass the gas info params
  // if params include gasPrice/gasLimit/nonce will cause loop
  const originEstimateRst = useEstimateTx(originParams) || {}
  const {
    gasPrice: estimateGasPrice,
    gasLimit: estimateGasLimit,
    nonce: rpcNonce,
    storageCollateralized: estimateStorageLimit,
  } = originEstimateRst || {}

  const errorMessage = useCheckBalanceAndGas(
    estimateRst,
    displayTokenAddress,
    isSendToken,
  )
  useEffect(() => {
    setBalanceError(errorMessage)
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
      !nonce && setNonce(formatHexToDecimal(initNonce || rpcNonce || ''))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isDapp,
    initGasLimit,
    initNonce,
    initGasPrice,
    initStorageLimit,
    setGasPrice,
    setNonce,
    setGasLimit,
    setStorageLimit,
    estimateGasPrice,
    estimateGasLimit,
    estimateStorageLimit,
    rpcNonce,
    gasLimit,
    storageLimit,
    gasPrice,
    nonce,
  ])

  // check balance when click send button
  const checkBalance = async () => {
    const {from, to, gasPrice, gas, value, storageLimit} = params
    const storageFeeDrip = bn16(storageLimit)
      .mul(bn16('0xde0b6b3a7640000' /* 1e18 */))
      .divn(1024)
    const gasFeeDrip = bn16(gas).mul(bn16(gasPrice))
    const txFeeDrip = gasFeeDrip.add(storageFeeDrip)
    const {address: tokenAddress, decimals} = displayToken
    try {
      const balanceData = await request(WALLET_GET_BALANCE, {
        users: [from],
        tokens: isNativeToken ? ['0x0'] : ['0x0'].concat(tokenAddress),
      })
      const balance = balanceData?.[from]

      if (isNativeToken) {
        if (bn16(balance['0x0']).lt(bn16(value).add(txFeeDrip))) {
          return t('balanceIsNotEnough')
        } else {
          return ''
        }
      } else {
        const {willPayCollateral, willPayTxFee} = await request(
          'cfx_checkBalanceAgainstTransaction',
          [from, to, gas, gasPrice, storageLimit, 'latest_state'],
        )
        if (
          bn16(balance[tokenAddress]).lt(
            bn16(convertValueToData(displayValue, decimals)),
          )
        ) {
          return t('balanceIsNotEnough')
        } else if (
          (bn16(balance['0x0']).lt(txFeeDrip) &&
            willPayTxFee &&
            willPayCollateral) ||
          (bn16(balance['0x0']).lt(storageFeeDrip) && willPayCollateral) ||
          (bn16(balance['0x0']).lt(gasFeeDrip) && willPayTxFee)
        ) {
          return t('gasFeeIsNotEnough')
        } else {
          return ''
        }
      }
    } catch (err) {
      console.error(err)
      return ''
    }
  }

  const onSend = async () => {
    setLoading(true)
    setSendStatus(HW_TX_STATUS.WAITING)
    if (isSendToken) {
      const error = await checkBalance()
      if (error) {
        setLoading(false)
        setBalanceError(error)
        return
      }
    }
    request(SEND_TRANSACTION, [params])
      .then(() => {
        setLoading(false)
        setSendStatus(HW_TX_STATUS.SUCCESS)
        clearSendTransactionParams()
        history.push(HOME)
      })
      .catch(error => {
        setLoading(false)
        setSendStatus(HW_TX_STATUS.REJECTED)
        if (!isHwAccount) {
          clearSendTransactionParams()
          console.error('error', error?.message ?? error)
          history.push(HOME)
        }
      })
  }

  const confirmDisabled = useDebouncedValue(
    !!balanceError || estimateRst.loading || isHwUnAuth,
    [!!balanceError, estimateRst.loading, isHwUnAuth],
  )

  return (
    <div className="flex flex-col h-full w-full relative">
      <TitleNav title={t('signTransaction')} hasGoBack={!isDapp} />
      <div className="flex flex-1 flex-col justify-between mt-1 pb-4">
        <div className="flex flex-col px-3">
          <AddressCard
            token={displayToken}
            fromAddress={displayFromAddress}
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
          <GasFee estimateRst={estimateRst} />
          {balanceError && (
            <span className="text-error text-xs inline-block mt-2">
              {balanceError}
            </span>
          )}
          <HwAlert open={isHwUnAuth} className="mt-3" />
          <Alert
            open={isHwOpenAlert}
            className="mt-3"
            type="warning"
            closable={false}
            width="w-full"
            content={t('hwOpenApp')}
          />
        </div>
        <div className="flex flex-col items-center">
          {isDapp && params.data && (
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
            />
          )}
          {/* {!isDapp && sendingTransaction && !isHwAccount && (
            <div className="fixed top-0 left-0 flex w-screen h-screen bg-[rgba(0,0,0,0.4)] items-center justify-center">
              <Loading />
            </div>
          )} */}
          {isHwAccount && <HwTransactionResult status={sendStatus} />}
        </div>
      </div>
    </div>
  )
}

export default ConfirmTransition
