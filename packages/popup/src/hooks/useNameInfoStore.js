import create from 'zustand'
import {getAddressNameInfos} from '@fluent-wallet/confluxscan-api/account'
import {supportsConfluxScanApi} from '@fluent-wallet/confluxscan-api/utils'
import useSWR from 'swr'
import {useMemo} from 'react'
import {decode, encode} from '@fluent-wallet/base32-address'

const NAME_INFO_BATCH_SIZE = 100

const normalizeAddress = address => {
  if (typeof address !== 'string') return ''
  if (address.includes(':')) {
    try {
      const {hexAddress, netId} = decode(address)
      return encode(hexAddress, netId).toLowerCase()
    } catch {
      // Preserve invalid addresses so metadata cannot break request rendering.
    }
  }
  return address.toLowerCase()
}

const getNetworkKey = network =>
  supportsConfluxScanApi(network) ? `${network.type}:${network.netId}` : null

const useNameInfoStore = create(set => ({
  contracts: {},

  fetchNameInfos: async ({addresses, network}) => {
    const networkKey = getNetworkKey(network)
    if (!addresses || addresses.length === 0 || !networkKey) return
    const result = {}
    let firstError
    for (
      let offset = 0;
      offset < addresses.length;
      offset += NAME_INFO_BATCH_SIZE
    ) {
      try {
        const res = await getAddressNameInfos({
          addresses: addresses.slice(offset, offset + NAME_INFO_BATCH_SIZE),
          networkId: network.netId,
        })
        const batchResult = {}
        Object.keys(res).forEach(key => {
          const info = res[key]
          // Missing metadata is unknown, not evidence of an unverified contract.
          if (!info || typeof info !== 'object' || Array.isArray(info)) return
          batchResult[normalizeAddress(key)] = {
            ...info,
            isVerified: !!info?.verification?.name,
            isNotable: !!info?.nameTag?.labels?.find(
              label => label === 'Verified',
            ),
          }
        })
        Object.assign(result, batchResult)
        set(state => ({
          contracts: {
            ...state.contracts,
            [networkKey]: {
              ...state.contracts[networkKey],
              ...batchResult,
            },
          },
        }))
      } catch (error) {
        // Finish remaining batches and keep successful data before SWR retries.
        firstError =
          firstError || error || new Error('Failed to fetch name information')
      }
    }
    if (firstError) throw firstError
    return result
  },
}))

// Reading metadata never starts a request or subscribes to unrelated addresses.
export function useAddressNameInfo(network, address) {
  const networkKey = getNetworkKey(network)
  const addressKey = normalizeAddress(address)
  return useNameInfoStore(state =>
    networkKey ? state.contracts[networkKey]?.[addressKey] : undefined,
  )
}

// SWR owns request lifecycle; Zustand shares metadata between different batches.
export function useFetchAddressNameInfos({
  addresses = [],
  network,
  autoFetch = true,
}) {
  const fetchNameInfos = useNameInfoStore(state => state.fetchNameInfos)
  const networkKey = getNetworkKey(network)
  const addressesKey = JSON.stringify(
    [...new Set(addresses.map(normalizeAddress).filter(Boolean))].sort(),
  )
  const normalizedAddresses = useMemo(
    () => JSON.parse(addressesKey),
    [addressesKey],
  )

  return useSWR(
    autoFetch && normalizedAddresses.length > 0 && networkKey
      ? ['name-info', networkKey, addressesKey]
      : null,
    () => fetchNameInfos({network, addresses: normalizedAddresses}),
    {
      refreshInterval: 0,
      onError: () => {},
    },
  )
}

export default useNameInfoStore
