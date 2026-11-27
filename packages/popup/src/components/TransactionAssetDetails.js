import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useRPC} from '@fluent-wallet/use-rpc'
import Tooltip from '@fluent-wallet/component-tooltip'
import {
  DownOutlined,
  QuestionCircleOutlined,
  UpOutlined,
} from '@fluent-wallet/component-icons'
import AddressDisplay from './AddressDisplay'
import {WALLET_ESTIMATE_ASSET_CHANGES} from '../constants/rpcMethods'
import {useMemo, useState} from 'react'
import {
  useCurrentAddress,
  useSingleTokenInfoWithNativeTokenSupport,
  useValid20Token,
} from '../hooks/useApi'
import {formatBalance} from '@fluent-wallet/data-format'
import {useDecodeSwapTransaction} from '../hooks/useDecodeSwapTransaction'

function DetailsTitle({title, tooltip}) {
  return (
    <div className="text-[14px] leading-[18px] font-normal text-gray-80 flex items-center gap-1 mb-4">
      {title}
      <Tooltip
        placement="top"
        trigger={['hover', 'focus']}
        content={
          <div>
            <div>{title}</div>
            <div>{tooltip}</div>
          </div>
        }
      >
        <button
          type="button"
          aria-label={title}
          className="text-gray-40 flex h-4 w-4 items-center justify-center"
        >
          <QuestionCircleOutlined className="h-4 w-4" />
        </button>
      </Tooltip>
    </div>
  )
}

DetailsTitle.propTypes = {
  title: PropTypes.string.isRequired,
  tooltip: PropTypes.string.isRequired,
}

function AssetChangeRow({label, children}) {
  return (
    <div className="flex justify-between gap-1">
      <span className="shrink-0 text-sm font-normal text-gray-40">{label}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-4 text-sm font-normal text-gray-80">
        {children}
      </div>
    </div>
  )
}
AssetChangeRow.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

function SwapDetails({swap}) {
  const {t} = useTranslation()

  return (
    <>
      <DetailsTitle
        title={t('swapDetails')}
        tooltip={t('swapDetailsTooltip')}
      />
      <AssetChangeRow
        label={
          swap.input.amountType === 'exact' ? t('youSend') : t('youMaximumSend')
        }
      >
        <AssetChange
          change={{
            direction: 'out',
            amount: swap.input.amount,
            asset: swap.input.asset,
          }}
        />
      </AssetChangeRow>
      {/* Output is shown only when the recipient matches the transaction's tx.from. */}
      {swap.output && (
        <>
          <div className="h-[1px] bg-gray-20 w-full my-3"></div>
          <AssetChangeRow
            label={
              swap.output.amountType === 'exact'
                ? t('youReceive')
                : t('youMinimumReceive')
            }
          >
            <AssetChange
              change={{
                direction: 'in',
                amount: swap.output.amount,
                asset: swap.output.asset,
              }}
            />
          </AssetChangeRow>
        </>
      )}
    </>
  )
}
SwapDetails.propTypes = {
  swap: PropTypes.object.isRequired,
}

function AssetChange({change}) {
  const isNativeToken = change.asset.type === 'native'
  const nativeToken = useSingleTokenInfoWithNativeTokenSupport(
    isNativeToken ? 'native' : undefined,
  )
  const token = useValid20Token(change.asset.address)
  const assetToken = isNativeToken ? nativeToken : token
  return (
    <div className="flex items-start gap-1 text-[14px] leading-[16px] overflow-hidden shrink-0">
      <div
        className={`font-semibold w-0 flex-1 truncate text-right ${
          change.direction === 'in' ? 'text-success' : 'text-error'
        }`}
      >
        {change.direction === 'in' ? '+' : '-'}
        <> {formatBalance(change.amount, assetToken.decimals)}</>
      </div>
      <AddressDisplay
        kind="token"
        address={change.asset.address}
        iconUrl={assetToken.logoURI}
        name={assetToken.name}
        symbol={assetToken.symbol}
        iconClassName="w-4 h-4"
        wrapperClassName="shrink-0"
      />
    </div>
  )
}
AssetChange.propTypes = {
  change: PropTypes.object,
}

function AssetChanges({changes, direction}) {
  const {t} = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const availableChanges = useMemo(() => {
    return changes?.filter(change => change.direction === direction) ?? []
  }, [changes, direction])
  const visibleChanges = isExpanded
    ? availableChanges
    : availableChanges.slice(0, 2)
  const hasMoreChanges = availableChanges.length > 2
  if (visibleChanges.length === 0) return
  return (
    <AssetChangeRow
      label={direction === 'out' ? t('youSend') : t('youReceive')}
    >
      <div className="max-h-[144px] overflow-y-auto flex flex-col gap-4">
        {visibleChanges.map((change, index) => {
          return <AssetChange key={index} change={change} />
        })}
      </div>
      {hasMoreChanges && (
        <button
          type="button"
          className="flex items-center justify-center text-sm font-normal text-primary w-fit self-end"
          onClick={() => setIsExpanded(value => !value)}
        >
          {t('showMore')}
          {isExpanded ? (
            <UpOutlined className="ml-1 h-3 w-3" />
          ) : (
            <DownOutlined className="ml-1 h-3 w-3" />
          )}
        </button>
      )}
    </AssetChangeRow>
  )
}
AssetChanges.propTypes = {
  changes: PropTypes.array,
  direction: PropTypes.oneOf(['in', 'out']),
}

// Selects transaction asset details: successful simulation results take priority;
// decoded swap request details are the fallback once simulation is not pending.
function TransactionAssetDetails({tx, sessionId}) {
  const {t} = useTranslation()
  const {
    data: {network},
  } = useCurrentAddress()
  const canEstimate = Boolean(
    tx &&
      tx.from &&
      (tx.to || tx.data || tx.input) &&
      !tx.authorizationList &&
      (tx.gasPrice || tx.maxFeePerGas || tx.maxPriorityFeePerGas),
  )

  const {data: estimateResult, error} = useRPC(
    [
      canEstimate ? WALLET_ESTIMATE_ASSET_CHANGES : null,
      network?.eid,
      sessionId,
      JSON.stringify(tx),
    ],
    [tx],
    {
      refreshInterval: 0,
      // Override the app's forced mount refresh. Fetch only when this
      // session/network/transaction key has no result yet.
      revalidateOnMount: undefined,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      // Keep simulation failures local and expose validation or node errors.
      onError: () => {},
    },
  )
  const swap = useDecodeSwapTransaction(tx, network)
  // SWR returns data for the current key only. Keep it visible during a
  // refresh; a new transaction/network without cached data stays hidden.
  const loading = canEstimate && !estimateResult && !error
  if (loading) return null

  // A successful simulation takes priority, including an empty result.
  // Keep cached success visible even when a background refresh fails.
  if (estimateResult?.status === 'success') {
    const changes = estimateResult.changes ?? []
    if (changes.length === 0) return null
    const hasOutChanges = changes.some(change => change.direction === 'out')
    const hasInChanges = changes.some(change => change.direction === 'in')
    return (
      <div className="w-full">
        <DetailsTitle
          title={t('estimateChanges')}
          tooltip={t('estimateChangesTooltip')}
        />
        {hasOutChanges && <AssetChanges direction="out" changes={changes} />}
        {hasOutChanges && hasInChanges && (
          <div className="h-[1px] bg-gray-20 w-full my-3"></div>
        )}
        {hasInChanges && <AssetChanges direction="in" changes={changes} />}
      </div>
    )
  }
  // Fall back to the request summary only without a successful simulation.
  if (swap) {
    return (
      <div className="w-full">
        <SwapDetails swap={swap} />
      </div>
    )
  }
  if (!canEstimate) return null

  // An eligible request reached a failure with no usable swap summary.
  return (
    <div className="w-full">
      <DetailsTitle
        title={t('estimateChanges')}
        tooltip={t('estimateChangesTooltip')}
      />
      <div>{t('unableEstimateChanges')}</div>
    </div>
  )
}
TransactionAssetDetails.propTypes = {
  tx: PropTypes.object,
  sessionId: PropTypes.string,
}

export default TransactionAssetDetails
