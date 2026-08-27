import PropTypes from 'prop-types'
import {useState, useEffect} from 'react'
import i18next from 'i18next'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import dayjs from 'dayjs'
import {isUndefined} from '@fluent-wallet/checks'
import {convertDataToValue} from '@fluent-wallet/data-format'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {cfxGetFeeData, ethGetFeeData} from '@fluent-wallet/estimate-tx'
import {NULL_HEX_ADDRESS} from '@fluent-wallet/consts'

import {
  transformToTitleCase,
  formatStatus,
  formatIntoChecksumAddress,
} from '../../../utils'
import {
  useNetworkTypeIsCfx,
  useCurrentTicker,
  useCurrentAddress,
} from '../../../hooks/useApi'
import {useDecodeData, useDappIcon, useServiceName} from '../../../hooks'
import {ROUTES} from '../../../constants'

const {RESEND_TRANSACTION} = ROUTES

import {
  HistoryStatusIcon,
  TransitionDetail,
  HistoryBalance,
  ResendButtons,
} from './'
import {shouldShowNegativeAmount} from '../amount'
import {getEip7702DelegateAddress} from './eip7702'

const ICON_COLOR = {
  failed: 'bg-error-10 text-error',
  executed: 'bg-[#F0FDFC] text-[#83DBC6]',
  pending: 'bg-warning-10 text-warning',
  confirmed: 'bg-success-10 text-success',
}

function HistoryItem({
  status,
  created,
  extra,
  receipt,
  payload,
  app,
  token,
  transactionUrl,
  hash,
  err,
  pendingAt = 0,
  copyButtonContainerClassName,
  copyButtonToastClassName,
}) {
  const history = useHistory()
  const [actionName, setActionName] = useState('')
  const [contractName, setContractName] = useState('')
  const [amount, setAmount] = useState('')
  const [symbol, setSymbol] = useState('')
  const [toAddress, setToAddress] = useState('')
  const [showDetail, setShowDetail] = useState(false)

  const {t} = useTranslation()
  const dappIconUrl = useDappIcon(app?.site?.icon)

  const {
    symbol: tokenSymbol,
    name: tokenName,
    decimals: tokenDecimals,
  } = useCurrentTicker()

  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const {
    data: {
      value: currentAddress,
      network,
      account: {nickname: currentAccountNickname} = {},
    },
  } = useCurrentAddress()
  const delegateAddress = getEip7702DelegateAddress(payload?.authorizationList)
  const isEip7702DelegationTx = Boolean(delegateAddress)
  const isEip7702RevokeTx =
    delegateAddress.toLowerCase() === NULL_HEX_ADDRESS.toLowerCase()

  const {data: nsName} = useServiceName({
    type: network?.type,
    netId: network?.netId,
    networkId: network?.eid,
    provider: window?.___CFXJS_USE_RPC__PRIVIDER,
    address: toAddress,
  })

  const fromAddress = payload?.from || ''
  const txStatus = formatStatus(status)

  // is external transition
  const isExternalTx =
    currentAddress !== payload?.from && currentAddress === payload?.to
  // color according to tx status
  const statusIconColor = ICON_COLOR?.[txStatus] ?? ''

  const createdTime = dayjs(created).format('YYYY/MM/DD HH:mm:ss')
  const {
    contractCreation,
    simple,
    contractInteraction,
    token20,
    sendAction,
    tokenPay,
  } = extra

  const showResendButtons =
    txStatus === 'pending' &&
    !isExternalTx &&
    !tokenPay &&
    new Date().getTime() - pendingAt > 5000

  const {txFeeDrip = '0x0'} = receipt
    ? networkTypeIsCfx
      ? cfxGetFeeData({
          gas: receipt?.gasUsed || '0x0',
          storageLimit: receipt?.storageCollateralized || '0x0',
          gasPrice: payload?.gasPrice || '0x1',
        })
      : ethGetFeeData({
          gas: receipt?.gasUsed || '0x0',
          gasPrice: receipt?.effectiveGasPrice || '0x1',
        })
    : {}

  const {decodeData} = useDecodeData({
    to: payload?.to,
    data: payload?.data,
  })

  const isTokenAction =
    token20 &&
    (decodeData?.name === 'transfer' ||
      decodeData?.name === 'transferFrom' ||
      decodeData?.name === 'approve')
  const displayAddressRole = isExternalTx
    ? 'fromAddress'
    : isTokenAction
    ? 'toAddress'
    : contractInteraction
    ? 'contract'
    : 'toAddress'
  const isNegativeAmount = shouldShowNegativeAmount({
    amount,
    methodName: decodeData?.name,
    methodArgs: decodeData?.args,
    accountAddress: currentAddress,
    isExternalTx,
  })

  const onCancelPendingTx = () => {
    history.push({
      pathname: RESEND_TRANSACTION,
      search: `type=cancel&hash=${hash}`,
    })
  }

  const onSpeedupPendingTx = () => {
    history.push({
      pathname: RESEND_TRANSACTION,
      search: `type=speedup&hash=${hash}`,
    })
  }

  useEffect(() => {
    if (isEip7702DelegationTx) {
      setActionName(t(isEip7702RevokeTx ? 'eip7702Revoke' : 'tx7702Delegation'))
      return
    }

    if (isExternalTx) {
      return setActionName(t('receive'))
    }
    setActionName(
      simple
        ? t('send')
        : decodeData?.name
        ? transformToTitleCase(decodeData.name)
        : '-',
    )
  }, [
    simple,
    isExternalTx,
    isEip7702DelegationTx,
    isEip7702RevokeTx,
    t,
    decodeData?.name,
  ])

  useEffect(() => {
    if (isEip7702DelegationTx) {
      setContractName(t('delegateTo'))
      return
    }

    if (simple && tokenName) {
      return setContractName(tokenName)
    }
    if (contractCreation) {
      return setContractName(t('contractCreation'))
    }
    if (contractInteraction) {
      if (token20 && token?.name) {
        return setContractName(token.name)
      }
      setContractName(t('contractInteraction'))
    }
  }, [
    tokenName,
    isEip7702DelegationTx,
    simple,
    token20,
    t,
    contractCreation,
    contractInteraction,
    networkTypeIsCfx,
    token?.name,
  ])

  useEffect(() => {
    if (isEip7702DelegationTx) {
      setSymbol('')
      setAmount('')
      setToAddress(delegateAddress)
      return
    }

    if (simple && tokenSymbol) {
      setToAddress(payload?.to ?? '')
      if (!isUndefined(tokenDecimals)) {
        setSymbol(tokenSymbol)
        setAmount(convertDataToValue(payload?.value, tokenDecimals) ?? '')
      }
      return
    }
    if (token20 && token) {
      const decimals = token?.decimals
      setSymbol(token?.symbol ?? '')
      if (actionName === 'Transfer' || actionName === 'Approve') {
        setToAddress(decodeData?.args?.[0] ?? '')
        setAmount(
          convertDataToValue(decodeData?.args?.[1]?._hex, decimals) ?? '',
        )
        return
      }
      if (actionName === 'TransferFrom') {
        setToAddress(decodeData?.args?.[1] ?? '')
        setAmount(
          convertDataToValue(decodeData?.args?.[2]?._hex, decimals) ?? '',
        )
        return
      }
    }

    setToAddress(payload?.to ?? '')
  }, [
    tokenSymbol,
    tokenDecimals,
    isEip7702DelegationTx,
    delegateAddress,
    simple,
    token20,
    actionName,
    networkTypeIsCfx,
    token,
    payload?.to,
    payload?.value,
    decodeData?.args,
  ])

  if (!actionName || !contractName) return null

  return (
    <div className="pt-3">
      <div
        className="flex items-center cursor-pointer p-3 bg-white mx-3 rounded"
        aria-hidden="true"
        onClick={() => setShowDetail(true)}
      >
        <HistoryStatusIcon
          txStatus={txStatus}
          dappIconUrl={dappIconUrl}
          isDapp={!!app}
          isEip7702Tx={isEip7702DelegationTx}
          isExternalTx={isExternalTx}
          className={statusIconColor}
        />

        <div className="flex-1 ml-2">
          <div className="flex items-center justify-between">
            {!!actionName && (
              <div className="text-gray-80 text-sm max-w-[120px] text-ellipsis font-medium">
                {actionName}
              </div>
            )}
            {amount ? (
              <HistoryBalance
                showNegative={isNegativeAmount}
                amount={amount}
                symbol={symbol}
              />
            ) : (
              <span className="text-gray-40 text-xs">--</span>
            )}
          </div>
          <div className="flex mt-0.5 items-center justify-between text-gray-40 text-xs">
            <span>{contractName}</span>
            <span>
              {nsName
                ? nsName
                : toAddress &&
                  shortenAddress(formatIntoChecksumAddress(toAddress))}
            </span>
          </div>
        </div>
      </div>
      {showResendButtons && (
        <ResendButtons
          hash={hash}
          sendAction={sendAction}
          className="mx-3 rounded-b text-sm text-primary"
          buttonClassName="shadow-fluent-4 border-transparent bg-primary-10 !h-6"
          buttonTextClassName="ml-2"
        />
      )}

      <TransitionDetail
        statusIconColor={statusIconColor}
        open={showDetail}
        isNegativeAmount={isNegativeAmount}
        onClose={() => setShowDetail(false)}
        txStatus={txStatus}
        dappIconUrl={dappIconUrl}
        app={app}
        createdTime={createdTime}
        amount={amount}
        symbol={symbol}
        receipt={receipt}
        isExternalTx={isExternalTx}
        fromAddress={fromAddress}
        toAddress={toAddress}
        displayAddressRole={displayAddressRole}
        nsName={nsName}
        actionName={actionName}
        copyButtonContainerClassName={copyButtonContainerClassName}
        copyButtonToastClassName={copyButtonToastClassName}
        txFeeDrip={txFeeDrip}
        hash={hash}
        transactionUrl={transactionUrl}
        payload={payload}
        isEip7702DelegationTx={isEip7702DelegationTx}
        currentAccountName={currentAccountNickname}
        errorType={i18next?.exists(err) ? err : 'unknownError'}
        onCancelPendingTx={onCancelPendingTx}
        onSpeedupPendingTx={onSpeedupPendingTx}
        gasFeeSymbol={tokenSymbol}
        sendAction={sendAction}
        showResendButtons={showResendButtons}
      />
    </div>
  )
}

HistoryItem.propTypes = {
  status: PropTypes.number.isRequired,
  created: PropTypes.number.isRequired,
  pendingAt: PropTypes.number,
  extra: PropTypes.object.isRequired,
  receipt: PropTypes.object,
  payload: PropTypes.object.isRequired,
  transactionUrl: PropTypes.string,
  hash: PropTypes.string,
  err: PropTypes.string,
  app: PropTypes.oneOfType([PropTypes.oneOf([null]), PropTypes.object]),
  token: PropTypes.oneOfType([PropTypes.oneOf([null]), PropTypes.object]),
  copyButtonContainerClassName: PropTypes.string,
  copyButtonToastClassName: PropTypes.string,
}
export default HistoryItem
