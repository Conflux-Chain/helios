import {useRPC} from '@fluent-wallet/use-rpc'
import {RPC_METHODS} from '../../constants'

const {WALLET_PREPARE_SPONSORSHIP} = RPC_METHODS

function useSponsorship({accountId, networkId, calls}) {
  const enabled =
    Boolean(calls) && accountId !== undefined && networkId !== undefined

  const {data, error, isValidating, mutate} = useRPC(
    enabled
      ? [
          WALLET_PREPARE_SPONSORSHIP,
          accountId,
          networkId,
          JSON.stringify(calls),
        ]
      : null,
    {accountId, networkId, calls},
    {
      fallbackData: null,
      refreshInterval: 0,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      dedupingInterval: 0,
      onError: () => {},
    },
  )

  const result = enabled && !isValidating && !error ? data : null

  return {
    supported: result?.supported === true,
    available: result?.available === true,
    reason: result?.reason || '',
    maxGasCost: result?.maxGasCost || null,
    requiredDelegationAction: result?.requiredDelegationAction || null,
    userOperation: result?.sponsorship?.userOperation ?? null,
    loading: enabled && (isValidating || (!data && !error)),
    error: enabled ? error : null,
    prepare: mutate,
  }
}

export default useSponsorship
