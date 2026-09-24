import useSWR from 'swr'
import {useRPCProvider} from '@fluent-wallet/use-rpc'
import {estimate} from '@fluent-wallet/estimate-tx'
import {useBalance} from './useApi'

export function useTransactionEstimate({
  transaction,
  network,
  tokensAmount = {},
}) {
  const {provider} = useRPCProvider()
  const transactionParams = {...transaction}
  const enabled = Boolean(
    network?.name &&
      network.chainId &&
      transactionParams.from &&
      (transactionParams.to || transactionParams.data),
  )

  const balances = useBalance(
    enabled ? transactionParams.from : null,
    network?.eid,
  )
  const nativeBalance =
    balances?.[transactionParams.from?.toLowerCase()]?.['0x0']

  const {data, error, isValidating} = useSWR(
    enabled && provider && nativeBalance !== undefined
      ? [
          'transactionEstimate',
          network.eid,
          network.name,
          network.type,
          network.chainId,
          network.gasBuffer,
          transactionParams,
          tokensAmount,
          nativeBalance,
        ]
      : null,
    () =>
      estimate(transactionParams, {
        type: network.type,
        request: rpcRequest =>
          provider.request({
            ...rpcRequest,
            networkName: network.name,
          }),
        tokensAmount,
        isFluentRequest: true,
        chainIdToGasBuffer: {
          [network.chainId]: network.gasBuffer,
        },
      }),
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
