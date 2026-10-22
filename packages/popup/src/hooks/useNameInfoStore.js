import create from 'zustand'
import {getAddressNameInfos} from '@fluent-wallet/confluxscan-api/account'
import {supportsConfluxScanApi} from '@fluent-wallet/confluxscan-api/utils'
import useSWR from 'swr'
import {useMemo} from 'react'
import {decode, encode} from '@fluent-wallet/base32-address'

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
    const res = await getAddressNameInfos({
      addresses,
      networkId: network.netId,
    })
    const result = {}
    Object.keys(res).forEach(key => {
      const info = res[key]
      // Missing metadata is unknown, not evidence of an unverified contract.
      if (!info || typeof info !== 'object' || Array.isArray(info)) return
      result[normalizeAddress(key)] = {
        ...info,
        isVerified: !!info?.verification?.name,
        isNotable: !!info?.nameTag?.labels?.find(label => label === 'Verified'),
      }
    })
    set(state => ({
      contracts: {
        ...state.contracts,
        [networkKey]: {
          ...state.contracts[networkKey],
          ...result,
        },
      },
    }))
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
