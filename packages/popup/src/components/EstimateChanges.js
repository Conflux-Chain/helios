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
    <div className="flex justify-between gap-1">
      <span className="shrink-0 text-sm font-normal text-gray-40">
        {direction === 'out' ? t('youSend') : t('youReceive')}
      </span>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-1 text-sm font-normal text-gray-80">
        <div className="flex flex-col gap-4 w-full">
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
        </div>
      </div>
    </div>
  )
}
AssetChanges.propTypes = {
  changes: PropTypes.array,
  direction: PropTypes.oneOf(['in', 'out']),
}

function EstimateChanges({tx, sessionId}) {
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
  // SWR returns data for the current key only. Keep it visible during a
  // refresh; a new transaction/network without cached data stays hidden.
  const loading = canEstimate && !estimateResult && !error
  const noAssetChanges =
    estimateResult?.status === 'success' &&
    estimateResult?.changes?.length === 0
  if (!canEstimate || loading || noAssetChanges) return null
  const hasOutChanges = estimateResult?.changes.some(
    change => change.direction === 'out',
  )
  const hasInChanges = estimateResult?.changes.some(
    change => change.direction === 'in',
  )
  return (
    <div className="w-full">
      <div className="text-[14px] leading-[18px] font-normal text-gray-80 flex items-center gap-1 mb-4">
        {t('estimateChanges')}
        <Tooltip
          placement="top"
          trigger={['hover', 'focus']}
          content={
            <div>
              <div>{t('estimateChanges')}</div>
              <div>{t('estimateChangesTooltip')}</div>
            </div>
          }
        >
          <button
            type="button"
            aria-label={t('estimateChanges')}
            className="text-gray-40 flex h-4 w-4 items-center justify-center"
          >
            <QuestionCircleOutlined className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>
      {error || estimateResult?.status !== 'success' ? (
        <div>{t('unableEstimateChanges')}</div>
      ) : (
        <>
          {hasOutChanges && (
            <AssetChanges direction="out" changes={estimateResult.changes} />
          )}
          {hasOutChanges && hasInChanges && (
            <div className="h-[1px] bg-gray-20 w-full my-3"></div>
          )}
          {hasInChanges && (
            <AssetChanges direction="in" changes={estimateResult.changes} />
          )}
        </>
      )}
    </div>
  )
}
EstimateChanges.propTypes = {
  tx: PropTypes.object,
  sessionId: PropTypes.string,
}

export default EstimateChanges
