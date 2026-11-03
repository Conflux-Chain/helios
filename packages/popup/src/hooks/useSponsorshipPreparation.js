import {useMemo} from 'react'
import useSWR, {unstable_serialize, useSWRConfig} from 'swr'
import {useRPCProvider} from '@fluent-wallet/use-rpc'
import {RPC_METHODS} from '../constants'

const {WALLET_PREPARE_SPONSORSHIP} = RPC_METHODS
const EXPIRY_MARGIN_MS = 5000

function isExpired(result) {
  return (
    result?.available === true &&
    (!Number.isFinite(result.validUntil) ||
      result.validUntil * 1000 <= Date.now() + EXPIRY_MARGIN_MS)
  )
}

export function useSponsorshipPreparation({
  accountId,
  networkId,
  calls,
  sessionId,
  enabled = true,
}) {
  const {provider} = useRPCProvider()
  const {cache} = useSWRConfig()
  const hasRequestContext = Boolean(
    calls?.length &&
      sessionId != null &&
      accountId != null &&
      networkId != null,
  )
  const shouldPrepare = enabled && hasRequestContext

  const key =
    shouldPrepare && provider
      ? [
          WALLET_PREPARE_SPONSORSHIP,
          sessionId,
          accountId,
          networkId,
          JSON.stringify(calls),
        ]
      : null
  const serializedKey = key ? unstable_serialize(key) : ''

  // Check expiry when entering this request, including re-enabling sponsorship.
  const expiredCachedData = useMemo(() => {
    const cached = serializedKey ? cache.get(serializedKey) : undefined
    return isExpired(cached) ? cached : null
  }, [cache, serializedKey])

  const {data, error, isValidating, mutate} = useSWR(
    key,
    async () => {
      try {
        const result = await provider.request({
          method: WALLET_PREPARE_SPONSORSHIP,
          params: {accountId, networkId, calls},
        })
        return isExpired(result)
          ? {...result, available: false, reason: 'expired', sponsorship: null}
          : result
      } catch (requestError) {
        // Cache failures too, so toggling does not retry the same request.
        return {
          supported: false,
          available: false,
          reason: 'backendUnavailable',
          error: requestError,
        }
      }
    },
    {
      // Override the app-level revalidateOnMount: true.
      revalidateOnMount: undefined,
      revalidateIfStale: Boolean(expiredCachedData),
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      dedupingInterval: 0,
      onError: () => {},
    },
  )

  const loading = Boolean(
    shouldPrepare &&
      !error &&
      (isValidating || !data || data === expiredCachedData),
  )
  const result = shouldPrepare && !loading && !error ? data : null
  const available = result?.available === true

  return {
    supported: result?.supported === true,
    available,
    // New drafts start enabled. Keep the switch after the user turns it off.
    showSwitch: hasRequestContext && (available || !enabled),
    reason: result?.reason || '',
    maxGasCost: result?.maxGasCost || null,
    requiredDelegationAction: result?.requiredDelegationAction || null,
    userOperation: result?.sponsorship?.userOperation ?? null,
    loading,
    error: shouldPrepare ? error || data?.error || null : null,
    refresh: () => {
      if (key && !isValidating) return mutate()
    },
  }
}
