import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import Tooltip from '@fluent-wallet/component-tooltip'
import {formatHexToDecimal} from '@fluent-wallet/data-format'
import {SendOutlined} from '@fluent-wallet/component-icons'
import {
  CFX_MAINNET_CURRENCY_SYMBOL,
  ETH_MAINNET_CURRENCY_SYMBOL,
} from '@fluent-wallet/consts'

import {formatIntoChecksumAddress, formatLocalizationLang} from '../../../utils'
import {SlideCard, CopyButton, WrapIcon} from '../../../components'
import {HistoryStatusIcon, HistoryBalance, ResendButtons} from './'

function TransitionItem({
  className = 'mt-3',
  transitionTitle = '',
  transitionValue = '',
  TransitionValueOverlay,
}) {
  return (
    <div className={className}>
      <p className="text-gray-40 text-xs">{transitionTitle}</p>
      {TransitionValueOverlay || (
        <div className="font-medium">{transitionValue}</div>
      )}
    </div>
  )
}

TransitionItem.propTypes = {
  className: PropTypes.string,
  transitionTitle: PropTypes.string,
  transitionValue: PropTypes.string,
  TransitionValueOverlay: PropTypes.node,
}

function TransitionDetail({
  open = false,
  isNegativeAmount = false,
  networkTypeIsCfx = false,
  onClose,
  txStatus = '',
  dappIconUrl = '',
  app,
  createdTime = '',
  amount = '',
  symbol = '',
  receipt,
  isExternalTx,
  fromAddress = '',
  toAddress = '',
  actionName = '',
  statusIconColor = '',
  copyButtonContainerClassName,
  copyButtonToastClassName,
  txFeeDrip = '0x0',
  hash = '',
  transactionUrl,
  payload,
  errorType,
  onCancelPendingTx,
  onSpeedupPendingTx,
}) {
  const {t, i18n} = useTranslation()
  const displayAddress = isExternalTx ? fromAddress : toAddress
  const displayActionName =
    txStatus === 'failed'
      ? formatLocalizationLang(i18n.language) === 'zh'
        ? `${actionName}（${t('failed')}）`
        : `${actionName}(${t('failed')})`
      : actionName

  return (
    <SlideCard
      id="tx-detail"
      cardClassName="pb-6"
      open={open}
      onClose={onClose}
      height="h-auto"
      cardTitle={
        <div className="flex items-center">
          <HistoryStatusIcon
            txStatus={txStatus}
            dappIconUrl={dappIconUrl}
            isDapp={!!app}
            className={statusIconColor}
            isExternalTx={isExternalTx}
          />
          <div className="ml-2">
            <div className="text-gray-80 font-medium">{displayActionName}</div>
            {txStatus === 'confirmed' && (
              <div className="text-xs text-gray-40 mt-0.5">{createdTime}</div>
            )}
          </div>
        </div>
      }
      cardContent={
        <div className="bg-white p-3 mt-3">
          {amount && (
            <TransitionItem
              className=""
              transitionTitle={t('amount')}
              TransitionValueOverlay={
                <HistoryBalance
                  showNegative={isNegativeAmount}
                  amount={amount}
                  symbol={symbol}
                  balanceFontSize={24}
                  balanceMaxWidth={240}
                  maxWidthStyle="max-w-[240px]"
                  symbolClassName="text-2lg text-gray-80 ml-1 !text-gray-80 !font-bold"
                  className="text-2lg !font-bold"
                />
              }
            />
          )}

          {displayAddress && (
            <TransitionItem
              transitionTitle={t(isExternalTx ? 'fromAddress' : 'toAddress')}
              TransitionValueOverlay={
                <div className="flex font-medium items-center">
                  <Tooltip content={displayAddress} placement="topLeft">
                    {shortenAddress(formatIntoChecksumAddress(displayAddress))}
                  </Tooltip>
                  {
                    <CopyButton
                      text={displayAddress}
                      className="w-3 h-3 text-primary"
                      containerClassName={copyButtonContainerClassName}
                      toastClassName={copyButtonToastClassName}
                      wrapperClassName="!w-5 !h-5 ml-1"
                    />
                  }
                </div>
              }
            />
          )}

          {receipt && (
            <TransitionItem
              transitionTitle={t('gasFee')}
              TransitionValueOverlay={
                <HistoryBalance
                  amount={txFeeDrip}
                  symbol={
                    networkTypeIsCfx
                      ? CFX_MAINNET_CURRENCY_SYMBOL
                      : ETH_MAINNET_CURRENCY_SYMBOL
                  }
                  symbolClassName="ml-1 !font-medium !text-gray-80"
                  className="!font-medium"
                />
              }
            />
          )}
          <TransitionItem
            transitionTitle={t('hash')}
            TransitionValueOverlay={
              <div className="flex items-center font-medium">
                <Tooltip content={hash} placement="topLeft">
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
            }
          />

          <TransitionItem
            transitionTitle={t('nonce')}
            transitionValue={`#${formatHexToDecimal(payload?.nonce)}`}
          />

          {txStatus === 'failed' && (
            <p className="text-error text-xs mt-3">{t(errorType)}</p>
          )}
        </div>
      }
      cardFooter={
        txStatus === 'pending' &&
        !isExternalTx && (
          <ResendButtons
            onCancelPendingTx={onCancelPendingTx}
            onSpeedupPendingTx={onSpeedupPendingTx}
            className="mt-3"
            blank="mr-3"
            buttonClassName="bg-primary-10 text-primary"
            buttonTextClassName="ml-1"
          />
        )
      }
    />
  )
}

TransitionDetail.propTypes = {
  open: PropTypes.bool,
  isExternalTx: PropTypes.bool,
  isNegativeAmount: PropTypes.bool,
  networkTypeIsCfx: PropTypes.bool,
  onClose: PropTypes.func,
  txStatus: PropTypes.string,
  dappIconUrl: PropTypes.string,
  statusIconColor: PropTypes.string,
  app: PropTypes.oneOfType([PropTypes.oneOf([null]), PropTypes.object]),
  createdTime: PropTypes.string,
  amount: PropTypes.string,
  symbol: PropTypes.string,
  receipt: PropTypes.object,
  fromAddress: PropTypes.string,
  toAddress: PropTypes.string,
  actionName: PropTypes.string,
  copyButtonContainerClassName: PropTypes.string,
  copyButtonToastClassName: PropTypes.string,
  txFeeDrip: PropTypes.string,
  hash: PropTypes.string,
  transactionUrl: PropTypes.string,
  payload: PropTypes.object.isRequired,
  errorType: PropTypes.string,
  onCancelPendingTx: PropTypes.func,
  onSpeedupPendingTx: PropTypes.func,
}

export default TransitionDetail
