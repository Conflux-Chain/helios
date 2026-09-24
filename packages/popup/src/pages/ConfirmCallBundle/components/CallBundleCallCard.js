import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {
  DownOutlined,
  EditOutlined,
  FileOutlined,
  QuestionCircleOutlined,
  RightOutlined,
} from '@fluent-wallet/component-icons'
import Tooltip from '@fluent-wallet/component-tooltip'

import {shortenAddress} from '@fluent-wallet/shorten-address'

import {CopyButton, DisplayBalance} from '../../../components'
import {
  bn16,
  formatIntoChecksumAddress,
  isEditableTokenApproval,
} from '../../../utils'
import {useDecodedCall} from '../../../hooks/useDecodedCall'
import {MaxUint256} from '@fluent-wallet/consts'
import {useTokenMetadata} from '../../../hooks/useTokenMetadata'

import {decodeCallData} from '@fluent-wallet/contract-method-name'

function CallBundleCallCard({
  call,
  requestedData,
  callIndex,
  network,
  expanded,
  onToggle,
  onEditAllowance,
}) {
  const {t} = useTranslation()
  const {to, data, value} = call
  const {ticker} = network
  const {decodedCall} = useDecodedCall({
    to,
    data,
    networkType: network.type,
    networkId: network.netId,
  })

  const address = formatIntoChecksumAddress(to)
  const detailsId = `call-bundle-call-${callIndex}`
  const hasValue = !bn16(value).isZero()
  const isApproveCall =
    decodedCall?.signature === 'approve(address,uint256)' && !hasValue
  const token = useTokenMetadata({
    address: isApproveCall ? to : undefined,
    network,
  })
  const spender = isApproveCall ? decodedCall.args[0] : null
  const spendingCap = isApproveCall ? decodedCall.args[1] : null

  const requestedApproval = isApproveCall ? decodeCallData(requestedData) : null
  const canEditAllowance = isEditableTokenApproval({
    decodedCall: requestedApproval,
    token,
  })

  return (
    <div className="rounded bg-gray-4 ring-1 ring-inset ring-gray-10">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={detailsId}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 p-4 text-left text-sm leading-4 text-gray-80"
      >
        <span>{t('callBundleCallTitle', {number: callIndex + 1})}</span>
        {expanded ? (
          <DownOutlined className="h-4 w-4 shrink-0 text-gray-60" />
        ) : (
          <RightOutlined className="h-4 w-4 shrink-0 text-gray-60" />
        )}
      </button>

      <div id={detailsId} hidden={!expanded}>
        <dl className="flex flex-col gap-4 px-4 pb-4 text-sm text-gray-80">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-gray-40">{t('callBundleInteractingWith')}</dt>
            <dd className="flex shrink-0 items-center gap-1">
              <FileOutlined className="h-4 w-4 text-gray-60" />
              <span className="text-gray-80" title={address}>
                {shortenAddress(address)}
              </span>
              <CopyButton
                text={address}
                className="text-gray-60 hover:text-primary"
                containerClassName="relative shrink-0"
                toastClassName="-top-8 right-0"
              />
            </dd>
          </div>

          <div className="flex items-center justify-between gap-2">
            <dt className="text-gray-40">{t('callBundleData')}</dt>
            <dd>
              <CopyButton
                text={data}
                className="text-gray-60 hover:text-primary"
                toastClassName="-top-8 right-0"
              />
            </dd>
          </div>

          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2">
            <dt className="text-gray-40">
              {t(decodedCall ? 'functionName' : 'callBundleHex')}
            </dt>
            <dd className="min-w-0 break-all text-right">
              {decodedCall ? (
                decodedCall.name
              ) : (
                <span className="font-mono">{data.slice(0, 10)}</span>
              )}
            </dd>

            {isApproveCall && token && (
              <dd className="relative col-span-2 ml-2 pl-4 pt-4">
                <span
                  aria-hidden="true"
                  className="absolute bottom-[9px] left-0 top-0 w-px bg-gray-20"
                />
                <dl className="flex flex-col gap-4">
                  <div className="relative flex items-center justify-between gap-2 before:absolute before:top-1/2 before:-left-4 before:h-px before:w-3 before:bg-gray-20">
                    <dt className="shrink-0 text-xs text-gray-40">
                      {t('spendingCap')}
                    </dt>
                    <dd className="flex min-w-0 items-center gap-1">
                      {canEditAllowance && (
                        <button
                          type="button"
                          aria-label={t('editPermission')}
                          onClick={onEditAllowance}
                          className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-primary hover:text-primary-dark"
                        >
                          <EditOutlined className="h-4 w-4" />
                        </button>
                      )}
                      <DisplayBalance
                        balance={spendingCap.toHexString()}
                        decimals={token.decimals}
                        mode="allowance"
                        isUnlimited={spendingCap.eq(MaxUint256)}
                        className="min-w-0 !font-body !font-normal"
                      />
                      <img
                        src="/images/default-token-icon.svg"
                        alt=""
                        className="h-4 w-4 shrink-0 rounded-full"
                      />
                      <span
                        className="max-w-[64px] truncate"
                        title={token.symbol}
                      >
                        {token.symbol}
                      </span>
                    </dd>
                  </div>

                  <div className="relative flex items-center justify-between gap-2 before:absolute before:top-1/2 before:-left-4 before:h-px before:w-3 before:bg-gray-20">
                    <dt className="flex shrink-0 items-center gap-1 text-xs text-gray-40">
                      {t('spender')}
                      <Tooltip
                        placement="top"
                        trigger={['hover', 'focus']}
                        content={
                          <p className="w-60">{t('permitSpenderTooltip')}</p>
                        }
                      >
                        <button
                          type="button"
                          aria-label={t('spender')}
                          className="flex h-4 w-4 items-center justify-center"
                        >
                          <QuestionCircleOutlined className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    </dt>
                    <dd className="flex shrink-0 items-center gap-1">
                      <FileOutlined className="h-4 w-4 text-gray-60" />
                      <span title={spender}>{shortenAddress(spender)}</span>
                      <CopyButton
                        text={spender}
                        className="text-gray-60 hover:text-primary"
                        containerClassName="relative shrink-0"
                        toastClassName="-top-8 right-0"
                      />
                    </dd>
                  </div>
                </dl>
              </dd>
            )}
          </div>

          {hasValue && (
            <div className="flex items-center justify-between gap-2">
              <dt className="text-gray-40">{t('amount')}</dt>
              <dd>
                <DisplayBalance
                  balance={value}
                  decimals={ticker.decimals}
                  symbol={ticker.symbol}
                  className="!font-body text-sm !font-normal"
                />
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}

CallBundleCallCard.propTypes = {
  call: PropTypes.shape({
    to: PropTypes.string.isRequired,
    data: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  }).isRequired,
  callIndex: PropTypes.number.isRequired,
  network: PropTypes.shape({
    eid: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    netId: PropTypes.number.isRequired,
    ticker: PropTypes.shape({
      decimals: PropTypes.number.isRequired,
      symbol: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  expanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,

  requestedData: PropTypes.string.isRequired,
  onEditAllowance: PropTypes.func.isRequired,
}

export default CallBundleCallCard
