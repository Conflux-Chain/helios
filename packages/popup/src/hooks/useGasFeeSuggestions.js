import useSWR from 'swr'
import {useRPCProvider} from '@fluent-wallet/use-rpc'

export function useGasFeeSuggestions({network, uses1559Fees}) {
  const {provider} = useRPCProvider()

  const enabled = Boolean(
    network?.name &&
      network.chainId &&
      (network.type === 'cfx' || network.type === 'eth') &&
      typeof uses1559Fees === 'boolean',
  )

  // Match the transaction's fee type, including Legacy on EIP-1559 networks.
  const method = uses1559Fees
    ? `${network?.type}_estimate1559Fee`
    : `${network?.type}_gasPrice`

  const {data, error, isValidating} = useSWR(
    enabled && provider
      ? [
          'gasFeeSuggestions',
          network.eid,
          network.name,
          network.chainId,
          method,
        ]
      : null,
    async () => {
      const result = await provider.request({
        method,
        networkName: network.name,
      })

      return uses1559Fees ? {gasInfoEip1559: result} : {gasPrice: result}
    },
    {
      revalidateOnMount: true,
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      onError: () => {},
    },
  )

  const loading = enabled && !error && (!data || isValidating)

  return {
    data: enabled && !loading && !error ? data : undefined,
    loading,
    error: enabled ? error : undefined,
  }
}
