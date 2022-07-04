/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from 'prop-types'
import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import dayjs from 'dayjs'
import {isUndefined} from '@fluent-wallet/checks'
import Button from '@fluent-wallet/component-button'
import Tooltip from '@fluent-wallet/component-tooltip'
import {
  convertDataToValue,
  formatHexToDecimal,
} from '@fluent-wallet/data-format'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {
  SendOutlined,
  RocketOutlined,
  CloseCircleOutlined,
} from '@fluent-wallet/component-icons'
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
  WrapIcon,
  CopyButton,
  DisplayBalance,
  SlideCard,
} from '../../../components'
import {HistoryStatusIcon} from './'

const ICON_COLOR = {
  failed: 'bg-error-10 text-error',
  executed: 'bg-[#F0FDFC] text-[#83DBC6]',
  pending: 'bg-warning-10 text-warning',
  confirmed: 'bg-success-10 text-success',
}

function HistoryBalance({
  isExternalTx = false,
  amount = '',
  actionName = '',
  symbol = '',
  balanceMaxWidth = 114,
  symbolClassName = 'text-2xs',
  className = '',
  balanceFontSize = 14,
  ...props
}) {
  return amount ? (
    <div className={`flex items-center ${className}`}>
      {amount != 0 && actionName !== 'Approve' && !isExternalTx && (
        <span>-</span>
      )}
      <DisplayBalance
        balance={amount}
        maxWidth={balanceMaxWidth}
        maxWidthStyle={`max-w-[${balanceMaxWidth}px]`}
        initialFontSize={balanceFontSize}
        {...props}
      />
      <span className={`text-gray-60 ml-0.5 ${symbolClassName}`}>{symbol}</span>
    </div>
  ) : null
}

HistoryBalance.propTypes = {
  className: PropTypes.string,
  amount: PropTypes.string,
  symbol: PropTypes.string,
  actionName: PropTypes.string,
  symbolClassName: PropTypes.string,
  balanceFontSize: PropTypes.number,
  balanceMaxWidth: PropTypes.number,
  isExternalTx: PropTypes.bool,
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

  // is external transition
  const isExternalTx = fromScan && currentAddress === payload?.to
  const fromAddress = payload?.from || ''

  const txStatus = formatStatus(status)
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
          className={`${ICON_COLOR?.[txStatus]}`}
        />

        <div className="flex-1 ml-2">
          <div className="flex items-center justify-between">
            <div className="text-gray-80 text-sm max-w-[120px] text-ellipsis font-medium">
              {actionName}
            </div>
            {amount ? (
              <HistoryBalance
                amount={amount}
                actionName={actionName}
                symbol={symbol}
                isExternalTx={isExternalTx}
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
        <div className="flex mx-3 bg-primary-10 h-6 rounded-b text-sm text-primary">
          <div
            id="cancel-tx"
            className="flex flex-1 cursor-pointer shadow-fluent-4 items-center justify-center"
            aria-hidden="true"
            onClick={onCancelPendingTx}
          >
            <CloseCircleOutlined className="w-3 h-3" />
            <span className="ml-2">{t('cancel')}</span>
          </div>

          <div
            id="speedup-tx"
            className="flex flex-1 cursor-pointer shadow-fluent-4 items-center justify-center"
            aria-hidden="true"
            onClick={onSpeedupPendingTx}
          >
            <RocketOutlined className="w-3 h-3" />
            <span className="ml-2">{t('speedup')}</span>
          </div>
        </div>
      )}

      <SlideCard
        id="tx-detail"
        cardClassName="pb-6"
        open={showDetail}
        onClose={() => setShowDetail(false)}
        height="h-auto"
        cardTitle={
          <div className="flex items-center">
            <HistoryStatusIcon
              txStatus={txStatus}
              dappIconUrl={dappIconUrl}
              isDapp={!!app}
              className={`${ICON_COLOR?.[txStatus]}`}
            />
            <div className="ml-2">
              <div className="text-gray-80 font-medium">
                {transformToTitleCase(txStatus)}
              </div>
              {txStatus === 'confirmed' && (
                <div className="text-xs text-gray-40 mt-0.5">{createdTime}</div>
              )}
            </div>
          </div>
        }
        cardContent={
          <div className="bg-white p-3 mt-3">
            {amount && (
              <div>
                <p className="text-gray-40 text-xs">{t('amount')}</p>
                <HistoryBalance
                  amount={amount}
                  actionName={actionName}
                  symbol={symbol}
                  balanceFontSize={24}
                  balanceMaxWidth={140}
                  symbolClassName="text-2lg text-gray-80 ml-1 !text-gray-80 !font-bold"
                  className="text-2lg !font-bold"
                />
              </div>
            )}

            <div>
              <p className="text-gray-40 text-xs mt-3">
                {t(isExternalTx ? 'fromAddress' : 'toAddress')}
              </p>
              <div className="flex font-medium items-center">
                <div>
                  {shortenAddress(
                    formatIntoChecksumAddress(
                      isExternalTx ? fromAddress : toAddress,
                    ),
                  )}
                </div>
                {
                  <CopyButton
                    text={isExternalTx ? fromAddress : toAddress}
                    className="w-3 h-3 text-primary"
                    containerClassName={copyButtonContainerClassName}
                    toastClassName={copyButtonToastClassName}
                    wrapperClassName="!w-5 !h-5 ml-1"
                  />
                }
              </div>
            </div>
            {receipt && (
              <div>
                <p className="text-gray-40 text-xs mt-3">{t('gasFee')}</p>
                <div className="flex items-center">
                  <DisplayBalance
                    balance={txFeeDrip}
                    maxWidth={114}
                    maxWidthStyle="max-w-[114px]"
                    className="!font-medium"
                  />
                  <span className="ml-1 font-medium">{symbol}</span>
                </div>
              </div>
            )}
            <div>
              <p className="text-gray-40 text-xs mt-3">{t('hash')}</p>
              <div className="flex items-center font-medium">
                <Tooltip content={hash || ''} placement="topLeft">
                  <div className="max-w-[100px] text-ellipsis">{hash}</div>
                </Tooltip>

                {hash && (
                  <CopyButton
                    text={hash}
                    className="w-3 h-3 text-primary"
                    containerClassName={copyButtonContainerClassName}
                    toastClassName={copyButtonToastClassName}
                    wrapperClassName="!w-5 !h-5"
                  />
                )}
                {transactionUrl && (
                  <WrapIcon
                    size="w-5 h-5 ml-2"
                    id="openScanTxUrl"
                    onClick={() => window.open(transactionUrl)}
                  >
                    <SendOutlined className="w-3 h-3 text-primary" />
                  </WrapIcon>
                )}
              </div>
            </div>
            <div>
              <p className="text-gray-40 text-xs mt-3">{t('nonce')}</p>
              <div className="font-medium">
                #{formatHexToDecimal(payload.nonce)}
              </div>
            </div>

            {txStatus === 'failed' && (
              <p className="text-error text-xs mt-3">{t(errorType)}</p>
            )}
          </div>
        }
        cardFooter={
          txStatus === 'pending' && (
            <div>
              <div className="flex mt-3">
                <Button
                  className="flex flex-1 mr-3 bg-primary-10 border-transparent hover:border-transparent"
                  variant="outlined"
                  key="cancel"
                  id="cancel-btn"
                  onClick={onCancelPendingTx}
                >
                  <div className="flex items-center">
                    <CloseCircleOutlined className="w-3 h-3" />
                    <span className="ml-1">{t('cancel')}</span>
                  </div>
                </Button>
                <Button
                  className="flex flex-1 mr-3 bg-primary-10 text-primary border-transparent hover:border-transparent"
                  variant="outlined"
                  key="confirm"
                  id="speedup-btn"
                  onClick={onSpeedupPendingTx}
                >
                  <div className="flex items-center">
                    <RocketOutlined className="w-3 h-3" />
                    <span className="ml-1">{t('speedup')}</span>
                  </div>
                </Button>
              </div>
            </div>
          )
        }
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
