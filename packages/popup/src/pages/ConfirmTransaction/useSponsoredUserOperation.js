import {useRPC} from '@fluent-wallet/use-rpc'
import {useCurrentTxStore} from '../../hooks'
import {RPC_METHODS} from '../../constants'

const {WALLET_PREPARE_SPONSORSHIP} = RPC_METHODS

function useSponsoredUserOperation({accountId, networkId, calls}) {
  const sponsorshipDeclined = useCurrentTxStore(
    state => state.sponsorshipDeclined,
  )
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
  const available = result?.available === true

  return {
    supported: result?.supported === true,
    available,
    isActive: available && !sponsorshipDeclined,
    reason: result?.reason || '',
    maxGasCost: result?.maxGasCost || null,
    requiredDelegationAction: result?.requiredDelegationAction || null,
    userOperation: result?.sponsorship?.userOperation ?? null,
    loading: enabled && (isValidating || (!data && !error)),
    error: enabled ? error : null,
    prepare: mutate,
  }
}

export default useSponsoredUserOperation
