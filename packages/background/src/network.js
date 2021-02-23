/**
 * @fileOverview bg netowrk controler
 * @name network.js
 */

import {MAINNET, TESTNET, LOCALHOST} from './consts'

// import.meta.env is injected by snowpack https://www.snowpack.dev/reference/environment-variables
// select testnet in dev, mainnet in prod, localhost in test
const DEFAULT_NETWORK = {
  development: TESTNET,
  test: LOCALHOST,
  production: MAINNET,
}[import.meta.env.MODE]

const NETWORK_ENDPOINTS = {
  MAINNET: import.meta.env.SNOWPACK_PUBLIC_MAINNET_RPC_ENDPOINT,
  TESTNET: import.meta.env.SNOWPACK_PUBLIC_TESTNET_RPC_ENDPOINT,
  LOCALHOST: import.meta.env.SNOWPACK_PUBLIC_LOCALHOST_RPC_ENDPOINT,
}
const DEFAULT_NETWORK_CONIFG = {
  type: DEFAULT_NETWORK,
  endpoint: NETWORK_ENDPOINTS[DEFAULT_NETWORK],
  name: DEFAULT_NETWORK,
}

export function initNetwork({store: {setState}}) {
  setState({networkStore: DEFAULT_NETWORK_CONIFG})
}
