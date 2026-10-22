import {
  CFX_SCAN_API_ENDPOINTS,
  CFX_MAINNET_NETID,
  CFX_TESTNET_NETID,
  CFX_ESPACE_MAINNET_NETID,
  CFX_ESPACE_TESTNET_NETID,
} from '@fluent-wallet/consts'

// Network IDs overlap between Core Space and Ethereum; always check the type.
export function supportsConfluxScanApi(network) {
  if (network?.type === 'cfx') return isCoreNetworkId(network.netId)
  return (
    network?.type === 'eth' &&
    (network.netId === CFX_ESPACE_MAINNET_NETID ||
      network.netId === CFX_ESPACE_TESTNET_NETID)
  )
}

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
