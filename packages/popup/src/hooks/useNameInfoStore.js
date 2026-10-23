import create from 'zustand'
import useSWR from 'swr'
import {useMemo} from 'react'
import {getAddressNameInfos} from '@fluent-wallet/confluxscan-api/account'
import {supportsConfluxScanApi} from '@fluent-wallet/confluxscan-api/utils'
import {normalizeBase32Address} from '../utils'

const NAME_INFO_BATCH_SIZE = 100

export function getAddressNameInfoKey(address) {
  if (typeof address !== 'string') return ''
  if (address.includes(':')) {
    try {
      return normalizeBase32Address(address)
    } catch {
      // Malformed metadata addresses must not interrupt request rendering.
    }
  }
  return address.toLowerCase()
}

export const getNameInfoNetworkKey = network =>
  supportsConfluxScanApi(network) ? `${network.type}:${network.netId}` : null

export function parseAddressNameInfos(response) {
  const result = {}
  Object.entries(response).forEach(([address, info]) => {
    // Missing metadata is unknown, not evidence of an unverified contract.
    if (!info || typeof info !== 'object' || Array.isArray(info)) return
    const labels = info.nameTag?.labels
    result[getAddressNameInfoKey(address)] = {
      ...info,
      isVerified: !!info.verification?.name,
      isNotable: Array.isArray(labels) && labels.includes('Verified'),
    }
  })
  return result
}

export async function fetchAddressNameInfos({addresses, network, onBatch}) {
  if (!addresses?.length || !getNameInfoNetworkKey(network)) return
  const result = {}
  let firstError
  for (
    let offset = 0;
    offset < addresses.length;
    offset += NAME_INFO_BATCH_SIZE
  ) {
    try {
      const response = await getAddressNameInfos({
        addresses: addresses.slice(offset, offset + NAME_INFO_BATCH_SIZE),
        networkId: network.netId,
      })
      const batch = parseAddressNameInfos(response)
      Object.assign(result, batch)
      onBatch(batch)
    } catch (error) {
      // Publish successful batches even when another batch needs an SWR retry.
      firstError =
        firstError || error || new Error('Failed to fetch name information')
    }
  }
  if (firstError) throw firstError
  return result
}

const useNameInfoStore = create(set => ({
  nameInfosByNetwork: {},
  mergeNameInfos: (networkKey, infos) =>
    set(state => ({
      nameInfosByNetwork: {
        ...state.nameInfosByNetwork,
        [networkKey]: {...state.nameInfosByNetwork[networkKey], ...infos},
      },
    })),
}))

// Reading metadata never starts a request or subscribes to unrelated addresses.
export function useAddressNameInfo(network, address) {
  const networkKey = getNameInfoNetworkKey(network)
  const addressKey = getAddressNameInfoKey(address)
  return useNameInfoStore(state =>
    networkKey ? state.nameInfosByNetwork[networkKey]?.[addressKey] : undefined,
  )
}

// SWR owns request lifecycle; Zustand shares metadata between different batches.
export function useFetchAddressNameInfos({
  addresses = [],
  network,
  autoFetch = true,
}) {
  const mergeNameInfos = useNameInfoStore(state => state.mergeNameInfos)
  const networkKey = getNameInfoNetworkKey(network)
  const addressesKey = JSON.stringify(
    [...new Set(addresses.map(getAddressNameInfoKey).filter(Boolean))].sort(),
  )
  const normalizedAddresses = useMemo(
    () => JSON.parse(addressesKey),
    [addressesKey],
  )

  return useSWR(
    autoFetch && normalizedAddresses.length > 0 && networkKey
      ? ['name-info', networkKey, addressesKey]
      : null,
    () =>
      fetchAddressNameInfos({
        network,
        addresses: normalizedAddresses,
        onBatch: infos => mergeNameInfos(networkKey, infos),
      }),
    {
      refreshInterval: 0,
      // Optional metadata failures must not trigger the global error-page redirect.
      onError: () => {},
    },
  )
}
