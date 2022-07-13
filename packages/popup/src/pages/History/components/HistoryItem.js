/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from 'prop-types'
import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import dayjs from 'dayjs'
import {isUndefined} from '@fluent-wallet/checks'
import {convertDataToValue} from '@fluent-wallet/data-format'
import {shortenAddress} from '@fluent-wallet/shorten-address'

import {processError as cfxProcessError} from '@fluent-wallet/conflux-tx-error'
import {processError as ethProcessError} from '@fluent-wallet/ethereum-tx-error'
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
import {useDecodeData, useDappIcon} from '../../../hooks'
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
  fromScan = false,
  copyButtonContainerClassName,
  copyButtonToastClassName,
  onResend,
}) {
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
    data: {value: currentAddress},
  } = useCurrentAddress()

  const fromAddress = payload?.from || ''
  const txStatus = formatStatus(status)

  // is external transition
  const isExternalTx = fromScan && currentAddress === payload?.to
  // show negative amount
  const isNegativeAmount =
    amount != 0 && actionName !== 'Approve' && !isExternalTx
  // color according to tx status
  const statusIconColor = ICON_COLOR?.[txStatus] ?? ''

  const createdTime = dayjs(created).format('YYYY/MM/DD HH:mm:ss')
  const {errorType} = err
    ? networkTypeIsCfx
      ? cfxProcessError(err)
      : ethProcessError(err)
    : 'unknownError'

  // TODO: 1559
  const {txFeeDrip = '0x0'} = receipt
    ? networkTypeIsCfx
      ? cfxGetFeeData({
          gas: receipt?.gasUsed || '0x0',
          storageLimit: receipt?.storageCollateralized || '0x0',
          gasPrice: receipt?.gasPrice || '0x1',
        })
      : ethGetFeeData({
          gas: receipt?.gasUsed || '0x0',
          gasPrice: receipt?.gasPrice || '0x1',
        })
    : {}

  const {contractCreation, simple, contractInteraction, token20} = extra

  const {decodeData} = useDecodeData({
    to: payload?.to,
    data: payload?.data,
  })

  const onCancelPendingTx = () => {
    onResend?.('cancel', {payload, token, extra, hash})
  }

  const onSpeedupPendingTx = () => {
    onResend?.('speedup', {payload, token, extra, hash})
  }

  useEffect(() => {
    setActionName(
      simple
        ? t('send')
        : decodeData?.name
        ? decodeData.name === 'unknown'
          ? t('unknown')
          : transformToTitleCase(decodeData.name)
        : '-',
    )
  }, [simple, Object.keys(decodeData).length])

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
    Boolean(token),
    t,
    contractCreation,
    contractInteraction,
    networkTypeIsCfx,
  ])

  useEffect(() => {
    if (simple && tokenSymbol && !isUndefined(tokenDecimals)) {
      setSymbol(tokenSymbol)
      setToAddress(payload?.to ?? '')
      setAmount(convertDataToValue(payload?.value, tokenDecimals) ?? '')
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
  }, [
    Boolean(token),
    tokenSymbol,
    tokenDecimals,
    simple,
    token20,
    contractInteraction,
    actionName,
    networkTypeIsCfx,
    Object.keys(payload).length,
    Object.keys(decodeData).length,
  ])

  if (!actionName || !contractName) return null

  return (
    <div>
      <div
        className="flex items-center cursor-pointer p-3 bg-white mx-3 mt-3 rounded"
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
              {toAddress
                ? shortenAddress(formatIntoChecksumAddress(toAddress))
                : ''}
            </span>
          </div>
        </div>
      </div>
      {txStatus === 'pending' && !isExternalTx && (
        <ResendButtons
          onCancelPendingTx={onCancelPendingTx}
          onSpeedupPendingTx={onSpeedupPendingTx}
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
        copyButtonContainerClassName={copyButtonContainerClassName}
        copyButtonToastClassName={copyButtonToastClassName}
        txFeeDrip={txFeeDrip}
        hash={hash}
        transactionUrl={transactionUrl}
        payload={payload}
        errorType={errorType}
        onCancelPendingTx={onCancelPendingTx}
        onSpeedupPendingTx={onSpeedupPendingTx}
      />
    </div>
  )
}

HistoryItem.propTypes = {
  status: PropTypes.number.isRequired,
  created: PropTypes.number.isRequired,
  extra: PropTypes.object.isRequired,
  receipt: PropTypes.object,
  payload: PropTypes.object.isRequired,
  transactionUrl: PropTypes.string,
  hash: PropTypes.string,
  err: PropTypes.string,
  fromScan: PropTypes.bool,
  app: PropTypes.oneOfType([PropTypes.oneOf([null]), PropTypes.object]),
  token: PropTypes.oneOfType([PropTypes.oneOf([null]), PropTypes.object]),
  copyButtonContainerClassName: PropTypes.string,
  copyButtonToastClassName: PropTypes.string,
  onResend: PropTypes.func.isRequired,
}
export default HistoryItem
