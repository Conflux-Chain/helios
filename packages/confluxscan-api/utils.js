import {
  CFX_SCAN_API_ENDPOINTS,
  CFX_MAINNET_NETID,
  CFX_TESTNET_NETID,
} from '@fluent-wallet/consts'

export function getURL(networkId, ...args) {
  return [CFX_SCAN_API_ENDPOINTS[networkId], ...args].reduce(
    (acc, s) => acc + s,
  )
}

export function isCoreNetworkId(networkId) {
  if (networkId === CFX_MAINNET_NETID || networkId === CFX_TESTNET_NETID)
    return true
  return false
}
