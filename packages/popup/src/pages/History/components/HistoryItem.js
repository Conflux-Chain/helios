import PropTypes from 'prop-types'
import {useState, useEffect, useRef} from 'react'
import {Big} from '@fluent-wallet/data-format'
import i18next from 'i18next'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import dayjs from 'dayjs'
import {isUndefined, isNumber} from '@fluent-wallet/checks'
import {convertDataToValue} from '@fluent-wallet/data-format'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {cfxGetFeeData, ethGetFeeData} from '@fluent-wallet/estimate-tx'

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

const ICON_COLOR = {
  failed: 'bg-error-10 text-error',
  executed: 'bg-[#F0FDFC] text-[#83DBC6]',
  pending: 'bg-warning-10 text-warning',
  confirmed: 'bg-success-10 text-success',
}

function HistoryItem({
  containerScrollTop = 0,
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
  const historyItemRef = useRef(null)
  const [actionName, setActionName] = useState('')
  const [contractName, setContractName] = useState('')
  const [amount, setAmount] = useState('')
  const [symbol, setSymbol] = useState('')
  const [toAddress, setToAddress] = useState('')
  const [showDetail, setShowDetail] = useState(false)
  const [isHide, setIsHide] = useState(false)

  const {t} = useTranslation()
  const dappIconUrl = useDappIcon(app?.site?.icon)

  const {
    symbol: tokenSymbol,
    name: tokenName,
    decimals: tokenDecimals,
  } = useCurrentTicker()

  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const {
    data: {value: currentAddress, network},
  } = useCurrentAddress()

  const {data: nsName} = useServiceName({
    type: network?.type,
    netId: network?.netId,
    provider: window?.___CFXJS_USE_RPC__PRIVIDER,
    address: toAddress,
    notSend: isHide,
  })

  const fromAddress = payload?.from || ''
  const txStatus = formatStatus(status)

  // is external transition
  const isExternalTx =
    currentAddress !== payload?.from && currentAddress === payload?.to
  // show negative amount
  const isNegativeAmount =
    amount != 0 && actionName !== 'Approve' && !isExternalTx
  // color according to tx status
  const statusIconColor = ICON_COLOR?.[txStatus] ?? ''

  const createdTime = dayjs(created).format('YYYY/MM/DD HH:mm:ss')

  const showResendButtons =
    txStatus === 'pending' &&
    !isExternalTx &&
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

  const {contractCreation, simple, contractInteraction, token20, sendAction} =
    extra

  const {decodeData} = useDecodeData({
    to: payload?.to,
    data: payload?.data,
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
    if (isExternalTx) {
      return setActionName(t('receive'))
    }
    setActionName(
      simple
        ? t('send')
        : decodeData?.name
        ? decodeData.name === 'unknown'
          ? t('unknown')
          : transformToTitleCase(decodeData.name)
        : '-',
    )
  }, [simple, isExternalTx, t, decodeData?.name])

  useEffect(() => {
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
    simple,
    token20,
    t,
    contractCreation,
    contractInteraction,
    networkTypeIsCfx,
    token?.name,
  ])

  useEffect(() => {
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
    simple,
    token20,
    actionName,
    networkTypeIsCfx,
    token,
    payload?.to,
    payload?.value,
    decodeData?.args,
  ])

  useEffect(() => {
    const clientHeight = historyItemRef?.current?.clientHeight
    const offsetTop = historyItemRef?.current?.offsetTop
    if (
      isNumber(clientHeight) &&
      isNumber(containerScrollTop) &&
      isNumber(offsetTop)
    ) {
      const distanceToParent = new Big(offsetTop).minus(52)
      setIsHide(distanceToParent.lt(new Big(containerScrollTop)))
    }
  }, [containerScrollTop])
  if (!actionName || !contractName) return null

  return (
    <div ref={historyItemRef} className="pt-3">
      <div
        className="flex items-center cursor-pointer p-3 bg-white mx-3 rounded"
        aria-hidden="true"
        onClick={() => setShowDetail(true)}
      >
        <HistoryStatusIcon
          txStatus={txStatus}
          dappIconUrl={dappIconUrl}
          isDapp={!!app}
          isExternalTx={isExternalTx}
          className={statusIconColor}
        />

        <div className="flex-1 ml-2">
          <div className="flex items-center justify-between">
            <div className="text-gray-80 text-sm max-w-[120px] text-ellipsis font-medium">
              {actionName}
            </div>
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
        nsName={nsName}
        actionName={actionName}
        copyButtonContainerClassName={copyButtonContainerClassName}
        copyButtonToastClassName={copyButtonToastClassName}
        txFeeDrip={txFeeDrip}
        hash={hash}
        transactionUrl={transactionUrl}
        payload={payload}
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
  containerScrollTop: PropTypes.number.isRequired,
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
