import browser from 'webextension-polyfill'

import {
  CFX_MAINNET_RPC_ENDPOINT,
  CFX_MAINNET_NAME,
  CFX_MAINNET_CHAINID,
  CFX_MAINNET_NETID,
  CFX_MAINNET_CURRENCY_SYMBOL,
  CFX_MAINNET_CURRENCY_NAME,
  CFX_TESTNET_RPC_ENDPOINT,
  CFX_TESTNET_NAME,
  CFX_TESTNET_CHAINID,
  CFX_TESTNET_NETID,
  CFX_TESTNET_CURRENCY_SYMBOL,
  CFX_TESTNET_CURRENCY_NAME,
  ETH_MAINNET_RPC_ENDPOINT,
  ETH_MAINNET_NAME,
  ETH_MAINNET_CHAINID,
  ETH_MAINNET_NETID,
  ETH_MAINNET_CURRENCY_SYMBOL,
  ETH_MAINNET_CURRENCY_NAME,
  ETH_ROPSTEN_RPC_ENDPOINT,
  ETH_ROPSTEN_NAME,
  ETH_ROPSTEN_CHAINID,
  ETH_ROPSTEN_NETID,
  ETH_ROPSTEN_CURRENCY_SYMBOL,
  ETH_ROPSTEN_CURRENCY_NAME,
  BSC_MAINNET_RPC_ENDPOINT,
  BSC_MAINNET_NAME,
  BSC_MAINNET_CHAINID,
  BSC_MAINNET_NETID,
  BSC_MAINNET_CURRENCY_SYMBOL,
  BSC_MAINNET_CURRENCY_NAME,
  BSC_TESTNET_RPC_ENDPOINT,
  BSC_TESTNET_NAME,
  BSC_TESTNET_CHAINID,
  BSC_TESTNET_NETID,
  BSC_TESTNET_CURRENCY_SYMBOL,
  BSC_TESTNET_CURRENCY_NAME,
  DEFAULT_CFX_HDPATH,
  DEFAULT_ETH_HDPATH,
  DEFAULT_CURRENCY_DECIMALS,
} from '@cfxjs/fluent-wallet-consts'

function initNetwork(d) {
  if (d.getNetwork().length) return

  d.t([
    {eid: -1, hdPath: {name: 'cfx-default', value: DEFAULT_CFX_HDPATH}},
    {eid: -2, hdPath: {name: 'eth-default', value: DEFAULT_ETH_HDPATH}},
    {
      network: {
        name: CFX_MAINNET_NAME,
        endpoint: CFX_MAINNET_RPC_ENDPOINT,
        type: 'cfx',
        chainId: CFX_MAINNET_CHAINID,
        netId: CFX_MAINNET_NETID,
        selected: true,
        ticker: {
          name: CFX_MAINNET_CURRENCY_NAME,
          symbol: CFX_MAINNET_CURRENCY_SYMBOL,
          decimals: DEFAULT_CURRENCY_DECIMALS,
        },
        hdPath: -1,
        builtin: true,
      },
    },
    {
      network: {
        name: CFX_TESTNET_NAME,
        endpoint: CFX_TESTNET_RPC_ENDPOINT,
        type: 'cfx',
        chainId: CFX_TESTNET_CHAINID,
        netId: CFX_TESTNET_NETID,
        ticker: {
          name: CFX_TESTNET_CURRENCY_NAME,
          symbol: CFX_TESTNET_CURRENCY_SYMBOL,
          decimals: DEFAULT_CURRENCY_DECIMALS,
        },
        hdPath: -1,
        builtin: true,
      },
    },
    {
      network: {
        name: ETH_MAINNET_NAME,
        endpoint: ETH_MAINNET_RPC_ENDPOINT,
        type: 'eth',
        chainId: ETH_MAINNET_CHAINID,
        netId: ETH_MAINNET_NETID,
        ticker: {
          name: ETH_MAINNET_CURRENCY_NAME,
          symbol: ETH_MAINNET_CURRENCY_SYMBOL,
          decimals: DEFAULT_CURRENCY_DECIMALS,
        },
        hdPath: -2,
        builtin: true,
      },
    },
    {
      network: {
        name: ETH_ROPSTEN_NAME,
        endpoint: ETH_ROPSTEN_RPC_ENDPOINT,
        type: 'eth',
        chainId: ETH_ROPSTEN_CHAINID,
        netId: ETH_ROPSTEN_NETID,
        ticker: {
          name: ETH_ROPSTEN_CURRENCY_NAME,
          symbol: ETH_ROPSTEN_CURRENCY_SYMBOL,
          decimals: DEFAULT_CURRENCY_DECIMALS,
        },
        hdPath: -2,
        builtin: true,
      },
    },
    {
      network: {
        name: BSC_MAINNET_NAME,
        endpoint: BSC_MAINNET_RPC_ENDPOINT,
        type: 'eth',
        chainId: BSC_MAINNET_CHAINID,
        netId: BSC_MAINNET_NETID,
        ticker: {
          name: BSC_MAINNET_CURRENCY_NAME,
          symbol: BSC_MAINNET_CURRENCY_SYMBOL,
          decimals: DEFAULT_CURRENCY_DECIMALS,
        },
        hdPath: -2,
        builtin: true,
      },
    },
    {
      network: {
        name: BSC_TESTNET_NAME,
        endpoint: BSC_TESTNET_RPC_ENDPOINT,
        type: 'eth',
        chainId: BSC_TESTNET_CHAINID,
        netId: BSC_TESTNET_NETID,
        ticker: {
          name: BSC_TESTNET_CURRENCY_NAME,
          symbol: BSC_TESTNET_CURRENCY_SYMBOL,
          decimals: DEFAULT_CURRENCY_DECIMALS,
        },
        hdPath: -2,
        builtin: true,
      },
    },
  ])
}

export default async function initDB(d, opts = {}) {
  const {importAllTx} = opts
  if (importAllTx) {
    await browser.storage.local.clear()
  }

  initNetwork(d)

  if (importAllTx) {
    d.batchTx(importAllTx)
  }
}
