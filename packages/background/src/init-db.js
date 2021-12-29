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
  // ETH_MAINNET_RPC_ENDPOINT,
  // ETH_MAINNET_NAME,
  // ETH_MAINNET_CHAINID,
  // ETH_MAINNET_NETID,
  // ETH_MAINNET_CURRENCY_SYMBOL,
  // ETH_MAINNET_CURRENCY_NAME,
  // ETH_ROPSTEN_RPC_ENDPOINT,
  // ETH_ROPSTEN_NAME,
  // ETH_ROPSTEN_CHAINID,
  // ETH_ROPSTEN_NETID,
  // ETH_ROPSTEN_CURRENCY_SYMBOL,
  // ETH_ROPSTEN_CURRENCY_NAME,
  // BSC_MAINNET_RPC_ENDPOINT,
  // BSC_MAINNET_NAME,
  // BSC_MAINNET_CHAINID,
  // BSC_MAINNET_NETID,
  // BSC_MAINNET_CURRENCY_SYMBOL,
  // BSC_MAINNET_CURRENCY_NAME,
  // BSC_TESTNET_RPC_ENDPOINT,
  // BSC_TESTNET_NAME,
  // BSC_TESTNET_CHAINID,
  // BSC_TESTNET_NETID,
  // BSC_TESTNET_CURRENCY_SYMBOL,
  // BSC_TESTNET_CURRENCY_NAME,
  DEFAULT_CFX_HDPATH,
  DEFAULT_ETH_HDPATH,
  DEFAULT_CURRENCY_DECIMALS,
} from '@fluent-wallet/consts'

function initNetwork(d) {
  if (d.getNetwork().length) return

  d.t([
    {eid: -1, hdPath: {name: 'cfx-default', value: DEFAULT_CFX_HDPATH}},
    {eid: -2, hdPath: {name: 'eth-default', value: DEFAULT_ETH_HDPATH}},
    {
      eid: -3,
      tokenList: {
        name: 'Fluent Default List',
        url: 'https://cdn.jsdelivr.net/gh/conflux-fans/token-list/cfx.fluent.json',
      },
    },
    // {
    //   eid: -4,
    //   tokenList: {
    //     name: 'Uniswap Default List',
    //     url: 'https://cdn.jsdelivr.net/gh/conflux-fans/token-list/eth.uniswap.json',
    //   },
    // },
    // {
    //   eid: -5,
    //   tokenList: {
    //     name: 'PancakeSwap Default List',
    //     url: 'https://cdn.jsdelivr.net/gh/conflux-fans/token-list/bsc.pancake.json',
    //   },
    // },
    {
      eid: -6,
      tokenList: {
        name: 'Fluent Default Conflux Testnet List',
        url: 'https://cdn.jsdelivr.net/gh/conflux-fans/token-list/cfx.test.fluent.json',
      },
    },
    {
      network: {
        name: CFX_MAINNET_NAME,
        endpoint: CFX_MAINNET_RPC_ENDPOINT,
        type: 'cfx',
        chainId: CFX_MAINNET_CHAINID,
        netId: CFX_MAINNET_NETID,
        selected: true,
        cacheTime: 1000,
        icon: 'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Conflux.svg',
        ticker: {
          name: CFX_MAINNET_CURRENCY_NAME,
          symbol: CFX_MAINNET_CURRENCY_SYMBOL,
          decimals: DEFAULT_CURRENCY_DECIMALS,
          iconUrls: [
            'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/cfx.svg',
          ],
        },
        scanUrl: 'confluxscan.io',
        hdPath: -1,
        builtin: true,
        balanceChecker: 'cfx:achxne2gfh8snrstkxn0f32ua2cf19zwky2y66hj2d',
        tokenList: -3,
        isMainnet: true,
      },
    },
    {
      network: {
        name: CFX_TESTNET_NAME,
        endpoint: CFX_TESTNET_RPC_ENDPOINT,
        type: 'cfx',
        chainId: CFX_TESTNET_CHAINID,
        netId: CFX_TESTNET_NETID,
        icon: 'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Conflux.svg',
        cacheTime: 1000,
        ticker: {
          name: CFX_TESTNET_CURRENCY_NAME,
          symbol: CFX_TESTNET_CURRENCY_SYMBOL,
          decimals: DEFAULT_CURRENCY_DECIMALS,
          iconUrls: [
            'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/cfx.svg',
          ],
        },
        hdPath: -1,
        scanUrl: 'testnet.confluxscan.io',
        balanceChecker: 'cfxtest:achxne2gfh8snrstkxn0f32ua2cf19zwkyw9tpbc6k',
        builtin: true,
        tokenList: -6,
        isTestnet: true,
      },
    },
    // {
    //   network: {
    //     name: ETH_MAINNET_NAME,
    //     endpoint: ETH_MAINNET_RPC_ENDPOINT,
    //     type: 'eth',
    //     chainId: ETH_MAINNET_CHAINID,
    //     netId: ETH_MAINNET_NETID,
    //     icon: 'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Ethereum.svg',
    //     cacheTime: 15000,
    //     ticker: {
    //       name: ETH_MAINNET_CURRENCY_NAME,
    //       symbol: ETH_MAINNET_CURRENCY_SYMBOL,
    //       decimals: DEFAULT_CURRENCY_DECIMALS,
    //       iconUrls: [
    //         'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/eth.svg',
    //       ],
    //     },
    //     scanUrl: 'etherscan.io',
    //     hdPath: -2,
    //     builtin: true,
    //     balanceChecker: '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39',
    //     tokenList: -4,
    //     isMainnet: true,
    //   },
    // },
    // {
    //   network: {
    //     name: ETH_ROPSTEN_NAME,
    //     endpoint: ETH_ROPSTEN_RPC_ENDPOINT,
    //     type: 'eth',
    //     chainId: ETH_ROPSTEN_CHAINID,
    //     netId: ETH_ROPSTEN_NETID,
    //     icon: 'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Ethereum.svg',
    //     cacheTime: 15000,

    //     ticker: {
    //       name: ETH_ROPSTEN_CURRENCY_NAME,
    //       symbol: ETH_ROPSTEN_CURRENCY_SYMBOL,
    //       decimals: DEFAULT_CURRENCY_DECIMALS,
    //       iconUrls: [
    //         'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/eth.svg',
    //       ],
    //     },
    //     scanUrl: 'ropsten.etherscan.io',
    //     hdPath: -2,
    //     builtin: true,
    //     isTestnet: true,
    //     balanceChecker: '0x8d9708f3f514206486d7e988533f770a16d074a7',
    //   },
    // },
    // {
    //   network: {
    //     name: BSC_MAINNET_NAME,
    //     endpoint: BSC_MAINNET_RPC_ENDPOINT,
    //     type: 'eth',
    //     chainId: BSC_MAINNET_CHAINID,
    //     netId: BSC_MAINNET_NETID,
    //     icon: 'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/BSC.svg',
    //     cacheTime: 2500,

    //     ticker: {
    //       name: BSC_MAINNET_CURRENCY_NAME,
    //       symbol: BSC_MAINNET_CURRENCY_SYMBOL,
    //       decimals: DEFAULT_CURRENCY_DECIMALS,
    //       iconUrls: [
    //         'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/bnb.svg',
    //       ],
    //     },
    //     scanUrl: 'bscscan.com',
    //     hdPath: -2,
    //     builtin: true,
    //     balanceChecker: '0xb12aec3a7e0b8cfba307203a33c88a3bbc0d9622',
    //     tokenList: -5,
    //     isMainnet: true,
    //   },
    // },
    // {
    //   network: {
    //     name: BSC_TESTNET_NAME,
    //     endpoint: BSC_TESTNET_RPC_ENDPOINT,
    //     type: 'eth',
    //     chainId: BSC_TESTNET_CHAINID,
    //     netId: BSC_TESTNET_NETID,
    //     icon: 'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/BSC.svg',
    //     cacheTime: 2500,

    //     ticker: {
    //       name: BSC_TESTNET_CURRENCY_NAME,
    //       symbol: BSC_TESTNET_CURRENCY_SYMBOL,
    //       decimals: DEFAULT_CURRENCY_DECIMALS,
    //       iconUrls: [
    //         'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/bnb.svg',
    //       ],
    //     },
    //     scanUrl: 'testnet.bscscan.com',
    //     hdPath: -2,
    //     builtin: true,
    //     isTestnet: true,
    //     balanceChecker: '0x5e6f706c8ca87c5fcbdbbfa74d69999dcda46b24',
    //   },
    // },
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
