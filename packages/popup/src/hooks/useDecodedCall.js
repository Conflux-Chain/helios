import {useMemo} from 'react'
import useSWRImmutable from 'swr/immutable'
import {
  decodeCallData,
  decodeCallDataWithScan,
  formatConfluxCallAddresses,
} from '@fluent-wallet/contract-method-name'
import {NETWORK_TYPE} from '../constants'

export function useDecodedCall({to, data, networkType, networkId}) {
  const localDecodedCall = useMemo(() => decodeCallData(data), [data])
  const hasNetwork = Boolean(networkType && networkId != null)
  const shouldFetch = Boolean(
    hasNetwork && !localDecodedCall && to && data && data !== '0x',
  )

  const {data: remoteDecodedCall} = useSWRImmutable(
    shouldFetch ? ['decodedCall', networkType, networkId, to, data] : null,
    () =>
      decodeCallDataWithScan({
        networkType,
        networkId,
        contractAddress: to,
        data,
      }),
    {
      // Override popup defaults: fetch only when there is no cached result.
      revalidateOnMount: undefined,
      refreshInterval: 0,
    },
  )

  const decodedCall = useMemo(() => {
    if (!hasNetwork) return null

    const result = localDecodedCall ?? remoteDecodedCall ?? null
    return networkType === NETWORK_TYPE.CFX
      ? formatConfluxCallAddresses(result, networkId)
      : result
  }, [hasNetwork, localDecodedCall, remoteDecodedCall, networkType, networkId])

  return {
    decodedCall,
    isDecoding: shouldFetch && remoteDecodedCall === undefined,
  }
}
