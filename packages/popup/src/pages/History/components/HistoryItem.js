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
  CancelOutlined,
} from '@fluent-wallet/component-icons'
import {processError as cfxProcessError} from '@fluent-wallet/conflux-tx-error'
import {processError as ethProcessError} from '@fluent-wallet/ethereum-tx-error'
import {cfxGetFeeData, ethGetFeeData} from '@fluent-wallet/estimate-tx'

import {
  transformToTitleCase,
  formatStatus,
  formatIntoChecksumAddress,
} from '../../../utils'
import {useNetworkTypeIsCfx, useCurrentTicker} from '../../../hooks/useApi'
import {useDecodeData, useDappIcon} from '../../../hooks'
import {
  WrapIcon,
  CopyButton,
  DisplayBalance,
  SlideCard,
} from '../../../components'
import {HistoryStatusIcon} from './'

// const tagColorStyle = {
//   failed: 'bg-error-10 text-error',
//   executed: 'bg-[#F0FDFC] text-[#83DBC6]',
//   pending: 'bg-warning-10 text-warning',
// }

function HistoryBalance({amount = '', actionName = '', symbol = '', ...props}) {
  // TODO: receive 的时候 不能 为-

  return amount ? (
    <div className="flex">
      {amount != 0 && actionName !== 'Approve' ? <span>-</span> : ''}
      <DisplayBalance
        balance={amount}
        maxWidth={114}
        maxWidthStyle="max-w-[114px]"
        {...props}
      />
      <span className="text-gray-60 ml-0.5">{symbol}</span>
    </div>
  ) : null
}

HistoryBalance.propTypes = {
  className: PropTypes.string,
  amount: PropTypes.string,
  symbol: PropTypes.string,
  actionName: PropTypes.string,
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

  const txStatus = formatStatus(status)
  const createdTime = dayjs(created).format('YYYY/MM/DD HH:mm:ss')
  // TODO: 透传 process error 并且判断 如果 状态失败 但是 都没有error 信息 给一个  unknownError
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

  console.log('txFeeDrip', txFeeDrip)
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
  // TODO：如果 是receive的 不可以加速
  return (
    <div>
      <div
        className="flex items-center cursor-pointer px-3 pb-3 pt-2 bg-white mx-3 mt-3 rounded"
        aria-hidden="true"
        onClick={() => setShowDetail(true)}
      >
        <HistoryStatusIcon
          txStatus={txStatus}
          dappIconUrl={dappIconUrl}
          isDapp={!!app}
        />

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="text-gray-80 text-sm max-w-[120px] text-ellipsis font-medium">
              {actionName}
            </div>
            {amount ? (
              <HistoryBalance
                amount={amount}
                actionName={actionName}
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
      {txStatus === 'pending' && (
        <div>
          <div id="cancel-tx" aria-hidden="true" onClick={onCancelPendingTx}>
            <RocketOutlined className="w-3 h-3 text-primary" />
            <span>{t('cancel')}</span>
          </div>
          <div id="speedup-tx" aria-hidden="true" onClick={onSpeedupPendingTx}>
            <CancelOutlined className="w-3 h-3 text-primary" />
            <span>{t('speedup')}</span>
          </div>
        </div>
      )}
      <SlideCard
        id="tx-detail"
        open={showDetail}
        onClose={() => setShowDetail(false)}
        cardTitle={
          <div>
            <HistoryStatusIcon
              txStatus={txStatus}
              dappIconUrl={dappIconUrl}
              isDapp={!!app}
            />
            <div>
              <div> {transformToTitleCase(txStatus)}</div>
              {txStatus === 'confirmed' && <div>{createdTime}</div>}
            </div>
          </div>
        }
        cardContent={
          <div>
            {amount && (
              <div>
                <p>{t('amount')}</p>
                <HistoryBalance
                  amount={amount}
                  actionName={actionName}
                  symbol={symbol}
                />
              </div>
            )}

            {/* TODO: or fromAddress */}
            <div>
              <p>{t('toAddress')}</p>
              <div>
                <div>
                  {toAddress
                    ? shortenAddress(formatIntoChecksumAddress(toAddress))
                    : ''}
                </div>
                {toAddress && (
                  <CopyButton
                    text={toAddress}
                    className="w-3 h-3 text-primary"
                    containerClassName={copyButtonContainerClassName}
                    toastClassName={copyButtonToastClassName}
                    wrapperClassName="!w-5 !h-5"
                  />
                )}
              </div>
            </div>
            {receipt && (
              <div>
                <p>{t('gasFee')}</p>
                <DisplayBalance
                  balance={txFeeDrip}
                  maxWidth={114}
                  maxWidthStyle="max-w-[114px]"
                />
              </div>
            )}
            <div>
              <p>{t('hash')}</p>
              <div>
                <Tooltip content={hash || ''} placement="topLeft">
                  <div className="max-w-[120px] text-ellipsis">{hash}</div>
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
              <p>{t('nonce')}</p>
              <div>#{formatHexToDecimal(payload.nonce)}</div>
            </div>
            {txStatus === 'failed' && <p>{t(errorType)}</p>}
          </div>
        }
        cardFooter={
          txStatus === 'pending' && (
            <div>
              <div className="flex mt-3">
                <Button
                  className="flex flex-1 mr-3"
                  variant="outlined"
                  key="cancel"
                  id="cancel-btn"
                  onClick={onCancelPendingTx}
                >
                  {t('cancel')}
                </Button>
                <Button
                  className="flex flex-1"
                  key="confirm"
                  id="speedup-btn"
                  onClick={onSpeedupPendingTx}
                >
                  {t('speedup')}
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
  app: PropTypes.oneOfType([PropTypes.oneOf([null]), PropTypes.object]),
  token: PropTypes.oneOfType([PropTypes.oneOf([null]), PropTypes.object]),
  copyButtonContainerClassName: PropTypes.string,
  copyButtonToastClassName: PropTypes.string,
  onResend: PropTypes.func.isRequired,
}
export default HistoryItem
