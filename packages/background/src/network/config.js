/**
 * @fileOverview network config
 * @name config.js
 */

import {MAINNET, TESTNET, LOCALHOST} from 'consts'

// select testnet in dev, mainnet in prod, localhost in test
export const DEFAULT_NETWORK = {
  development: TESTNET,
  test: LOCALHOST,
  production: MAINNET,
}[import.meta.env.NODE_ENV]

export const NETWORK_ENDPOINTS = {
  MAINNET: import.meta.env.SNOWPACK_PUBLIC_MAINNET_RPC_ENDPOINT,
  TESTNET: import.meta.env.SNOWPACK_PUBLIC_TESTNET_RPC_ENDPOINT,
  LOCALHOST: import.meta.env.SNOWPACK_PUBLIC_LOCALHOST_RPC_ENDPOINT,
}

export const BUILT_IN_NETWORKS = {
  [NETWORK_ENDPOINTS[MAINNET]]: {
    endpoints: NETWORK_ENDPOINTS[MAINNET],
    type: MAINNET,
    name: MAINNET,
  },
  [NETWORK_ENDPOINTS[TESTNET]]: {
    endpoints: NETWORK_ENDPOINTS[TESTNET],
    type: TESTNET,
    name: TESTNET,
  },
  [NETWORK_ENDPOINTS[LOCALHOST]]: {
    endpoints: NETWORK_ENDPOINTS[LOCALHOST],
    type: LOCALHOST,
    name: LOCALHOST,
  },
}
