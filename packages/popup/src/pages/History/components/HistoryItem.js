/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from 'prop-types'
import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import dayjs from 'dayjs'
import {isUndefined} from '@fluent-wallet/checks'
import {
  convertDataToValue,
  formatHexToDecimal,
} from '@fluent-wallet/data-format'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {
  CloseCircleFilled,
  ReloadOutlined,
  SendOutlined,
} from '@fluent-wallet/component-icons'
import {transformToTitleCase, formatStatus} from '../../../utils'
import {useNetworkTypeIsCfx, useCurrentTicker} from '../../../hooks/useApi'
import {useDecodeData} from '../../../hooks'
import {
  WrapIcon,
  CopyButton,
  DisplayBalance,
  CustomTag,
} from '../../../components'

const tagColorStyle = {
  failed: 'bg-error-10 text-error',
  executed: 'bg-[#F0FDFC] text-[#83DBC6]',
  pending: 'bg-warning-10 text-warning',
  sending: 'bg-warning-10 text-warning',
}

function WrapperWithCircle({children, className}) {
  return (
    <div
      className={`${className} flex items-center justify-center	rounded-full w-3 h-3 mr-1`}
    >
      {children}
    </div>
  )
}

WrapperWithCircle.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node]).isRequired,
  className: PropTypes.string,
}

function HistoryItem({
  status,
  created,
  extra,
  payload,
  app,
  token,
  transactionUrl,
  hash,
  copyButtonContainerClassName,
  copyButtonToastClassName,
}) {
  const [actionName, setActionName] = useState('')
  const [contractName, setContractName] = useState('')
  const [amount, setAmount] = useState('')
  const [symbol, setSymbol] = useState('')
  const [toAddress, setToAddress] = useState('')
  const {t} = useTranslation()
  const {
    symbol: tokenSymbol,
    name: tokenName,
    decimals: tokenDecimals,
  } = useCurrentTicker()

  const networkTypeIsCfx = useNetworkTypeIsCfx()

  const txStatus = formatStatus(status)
  const tagColor = tagColorStyle[txStatus] ?? ''
  const createdTime = dayjs(created).format('YYYY/MM/DD HH:mm:ss')
  const {contractCreation, simple, contractInteraction, token20} = extra

  // TODO: should throw error in decode data
  const {decodeData} = useDecodeData({
    to: payload?.to,
    data: payload?.data,
  })
  useEffect(() => {
    setActionName(
      simple
        ? t('send')
        : transformToTitleCase(decodeData?.name) || t('unknown'),
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
    <div className="px-3 pb-3 pt-2 bg-white mx-3 mt-3 rounded">
      <div className="flex justify-between">
        <div className="relative">
          {txStatus === 'confirmed' ? (
            <div className="text-gray-60 text-xs">
              <span>#{formatHexToDecimal(payload.nonce)}</span>
              <span className="ml-2">{createdTime}</span>
            </div>
          ) : (
            <CustomTag
              className={`${tagColor} absolute flex items-center h-6 px-2.5 -left-3 -top-2`}
              width="w-auto"
              roundedStyle="rounded-tl rounded-br-lg"
            >
              {txStatus === 'failed' ? (
                <CloseCircleFilled className="w-3 h-3 mr-1" />
              ) : txStatus === 'executed' ? (
                <WrapperWithCircle className="bg-[#83DBC6]">
                  <ReloadOutlined className="w-2 h-2 text-white" />
                </WrapperWithCircle>
              ) : txStatus === 'pending' || txStatus === 'sending' ? (
                <WrapperWithCircle className="bg-[#F0955F]">
                  <ReloadOutlined className="w-2 h-2 text-white" />
                </WrapperWithCircle>
              ) : null}
              <span className="text-sm">{transformToTitleCase(txStatus)}</span>
            </CustomTag>
          )}
        </div>
        <div className="flex">
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
      <div className="mt-3 flex items-center">
        <div
          className={`${
            !app ? 'bg-success-10 border-success-10' : 'border-gray-20'
          } w-8 h-8 rounded-full border-solid border flex items-center justify-center mr-2`}
        >
          {app ? (
            <img
              src={app?.site?.icon || '/images/default-dapp-icon.svg'}
              alt="favicon"
              className="w-4 h-4"
            />
          ) : (
            <SendOutlined className="w-4 h-4 text-success" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="text-gray-80 text-sm max-w-[120px] text-ellipsis font-medium">
              {actionName}
            </div>
            {amount ? (
              <div className="flex">
                {amount != 0 && actionName !== 'Approve' ? <span>-</span> : ''}
                <DisplayBalance
                  balance={amount}
                  maxWidth={114}
                  maxWidthStyle="max-w-[114px]"
                />
                <span className="text-gray-60 ml-0.5">{symbol}</span>
              </div>
            ) : (
              <span className="text-gray-40 text-xs">--</span>
            )}
          </div>
          <div className="flex mt-0.5 items-center justify-between text-gray-40 text-xs">
            <span>{contractName}</span>
            <span>{toAddress ? shortenAddress(toAddress) : ''}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

HistoryItem.propTypes = {
  status: PropTypes.number.isRequired,
  created: PropTypes.number.isRequired,
  extra: PropTypes.object.isRequired,
  payload: PropTypes.object.isRequired,
  transactionUrl: PropTypes.string,
  hash: PropTypes.string,
  app: PropTypes.oneOfType([PropTypes.oneOf([null]), PropTypes.object]),
  token: PropTypes.oneOfType([PropTypes.oneOf([null]), PropTypes.object]),
  copyButtonContainerClassName: PropTypes.string,
  copyButtonToastClassName: PropTypes.string,
}
export default HistoryItem
