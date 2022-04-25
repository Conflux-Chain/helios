import browser from 'webextension-polyfill'

import {
  CFX_MAINNET_RPC_ENDPOINT,
  CFX_MAINNET_NAME,
  CFX_MAINNET_CHAINID,
  CFX_MAINNET_NETID,
  CFX_MAINNET_CURRENCY_SYMBOL,
  CFX_MAINNET_CURRENCY_NAME,
  CFX_MAINNET_EXPLORER_URL,
  CFX_ESPACE_MAINNET_RPC_ENDPOINT,
  CFX_ESPACE_MAINNET_NAME,
  CFX_ESPACE_MAINNET_CHAINID,
  CFX_ESPACE_MAINNET_NETID,
  CFX_ESPACE_MAINNET_CURRENCY_SYMBOL,
  CFX_ESPACE_MAINNET_CURRENCY_NAME,
  CFX_ESPACE_MAINNET_EXPLORER_URL,
  CFX_ESPACE_TESTNET_RPC_ENDPOINT,
  CFX_ESPACE_TESTNET_NAME,
  CFX_ESPACE_TESTNET_CHAINID,
  CFX_ESPACE_TESTNET_NETID,
  CFX_ESPACE_TESTNET_CURRENCY_SYMBOL,
  CFX_ESPACE_TESTNET_CURRENCY_NAME,
  CFX_ESPACE_TESTNET_EXPLORER_URL,
  CFX_TESTNET_RPC_ENDPOINT,
  CFX_TESTNET_NAME,
  CFX_TESTNET_CHAINID,
  CFX_TESTNET_NETID,
  CFX_TESTNET_CURRENCY_SYMBOL,
  CFX_TESTNET_CURRENCY_NAME,
  CFX_TESTNET_EXPLORER_URL,
  ETH_MAINNET_RPC_ENDPOINT,
  ETH_MAINNET_NAME,
  ETH_MAINNET_CHAINID,
  ETH_MAINNET_NETID,
  ETH_MAINNET_CURRENCY_SYMBOL,
  ETH_MAINNET_CURRENCY_NAME,
  ETH_MAINNET_EXPLORER_URL,
  ETH_ROPSTEN_RPC_ENDPOINT,
  ETH_ROPSTEN_NAME,
  ETH_ROPSTEN_CHAINID,
  ETH_ROPSTEN_NETID,
  ETH_ROPSTEN_CURRENCY_SYMBOL,
  ETH_ROPSTEN_CURRENCY_NAME,
  ETH_ROPSTEN_EXPLORER_URL,
  ETH_RINKEBY_RPC_ENDPOINT,
  ETH_RINKEBY_NAME,
  ETH_RINKEBY_CHAINID,
  ETH_RINKEBY_NETID,
  ETH_RINKEBY_CURRENCY_SYMBOL,
  ETH_RINKEBY_CURRENCY_NAME,
  ETH_RINKEBY_EXPLORER_URL,
  ETH_GOERLI_RPC_ENDPOINT,
  ETH_GOERLI_NAME,
  ETH_GOERLI_CHAINID,
  ETH_GOERLI_NETID,
  ETH_GOERLI_CURRENCY_SYMBOL,
  ETH_GOERLI_CURRENCY_NAME,
  ETH_GOERLI_EXPLORER_URL,
  ETH_KOVAN_RPC_ENDPOINT,
  ETH_KOVAN_NAME,
  ETH_KOVAN_CHAINID,
  ETH_KOVAN_NETID,
  ETH_KOVAN_CURRENCY_SYMBOL,
  ETH_KOVAN_CURRENCY_NAME,
  ETH_KOVAN_EXPLORER_URL,
  DEFAULT_CFX_HDPATH,
  DEFAULT_ETH_HDPATH,
  DEFAULT_CURRENCY_DECIMALS,
} from '@fluent-wallet/consts'

function initNetwork(d) {
  if (d.getNetwork().length) return

  d.t([
    // hdpaths
    {eid: -1, hdPath: {name: 'cfx-default', value: DEFAULT_CFX_HDPATH}},
    {eid: -2, hdPath: {name: 'eth-default', value: DEFAULT_ETH_HDPATH}},

    // token lists
    {
      eid: -3,
      tokenList: {
        name: 'Fluent Default List',
        url: 'https://cdn.jsdelivr.net/gh/conflux-fans/token-list/cfx.fluent.json',
      },
    },
    {
      eid: -4,
      tokenList: {
        name: 'Uniswap Default List',
        url: 'https://cdn.jsdelivr.net/gh/conflux-fans/token-list/eth.uniswap.json',
      },
    },
    {
      eid: -5,
      tokenList: {
        name: 'Fluent Default Conflux Testnet List',
        url: 'https://cdn.jsdelivr.net/gh/conflux-fans/token-list/cfx.test.fluent.json',
      },
    },

    // mainnets
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
        scanUrl: CFX_MAINNET_EXPLORER_URL,
        hdPath: -1,
        builtin: true,
        balanceChecker: 'cfx:achxne2gfh8snrstkxn0f32ua2cf19zwky2y66hj2d',
        tokenList: -3,
        isMainnet: true,
      },
    },
    {
      network: {
        name: CFX_ESPACE_MAINNET_NAME,
        endpoint: CFX_ESPACE_MAINNET_RPC_ENDPOINT,
        type: 'eth',
        chainId: CFX_ESPACE_MAINNET_CHAINID,
        netId: CFX_ESPACE_MAINNET_NETID,
        cacheTime: 4000,
        icon: 'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Conflux.svg',
        ticker: {
          name: CFX_ESPACE_MAINNET_CURRENCY_NAME,
          symbol: CFX_ESPACE_MAINNET_CURRENCY_SYMBOL,
          decimals: DEFAULT_CURRENCY_DECIMALS,
          iconUrls: [
            'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/cfx.svg',
          ],
        },
        scanUrl: CFX_ESPACE_MAINNET_EXPLORER_URL,
        hdPath: -2,
        builtin: true,
        balanceChecker: '0x74191f6b288dff3db43b34d3637842c8146e2103',
        // tokenList: -3,
        isMainnet: true,
      },
    },
    {
      network: {
        name: ETH_MAINNET_NAME,
        endpoint: ETH_MAINNET_RPC_ENDPOINT,
        type: 'eth',
        chainId: ETH_MAINNET_CHAINID,
        netId: ETH_MAINNET_NETID,
        icon: 'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Ethereum.svg',
        cacheTime: 15000,
        ticker: {
          name: ETH_MAINNET_CURRENCY_NAME,
          symbol: ETH_MAINNET_CURRENCY_SYMBOL,
          decimals: DEFAULT_CURRENCY_DECIMALS,
          iconUrls: [
            'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/eth.svg',
          ],
        },
        scanUrl: ETH_MAINNET_EXPLORER_URL,
        hdPath: -2,
        builtin: true,
        balanceChecker: '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39',
        tokenList: -4,
        isMainnet: true,
      },
    },

    // testnets
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
        scanUrl: CFX_TESTNET_EXPLORER_URL,
        balanceChecker: 'cfxtest:achxne2gfh8snrstkxn0f32ua2cf19zwkyw9tpbc6k',
        builtin: true,
        tokenList: -5,
        isTestnet: true,
      },
    },
    {
      network: {
        name: CFX_ESPACE_TESTNET_NAME,
        endpoint: CFX_ESPACE_TESTNET_RPC_ENDPOINT,
        type: 'eth',
        chainId: CFX_ESPACE_TESTNET_CHAINID,
        netId: CFX_ESPACE_TESTNET_NETID,
        icon: 'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Conflux.svg',
        cacheTime: 4000,
        ticker: {
          name: CFX_ESPACE_TESTNET_CURRENCY_NAME,
          symbol: CFX_ESPACE_TESTNET_CURRENCY_SYMBOL,
          decimals: DEFAULT_CURRENCY_DECIMALS,
          iconUrls: [
            'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/cfx.svg',
          ],
        },
        hdPath: -2,
        scanUrl: CFX_ESPACE_TESTNET_EXPLORER_URL,
        balanceChecker: '0x74191f6b288dff3db43b34d3637842c8146e2103',
        builtin: true,
        isTestnet: true,
      },
    },
    {
      network: {
        name: ETH_ROPSTEN_NAME,
        endpoint: ETH_ROPSTEN_RPC_ENDPOINT,
        type: 'eth',
        chainId: ETH_ROPSTEN_CHAINID,
        netId: ETH_ROPSTEN_NETID,
        icon: 'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Ethereum.svg',
        cacheTime: 15000,

        ticker: {
          name: ETH_ROPSTEN_CURRENCY_NAME,
          symbol: ETH_ROPSTEN_CURRENCY_SYMBOL,
          decimals: DEFAULT_CURRENCY_DECIMALS,
          iconUrls: [
            'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/eth.svg',
          ],
        },
        scanUrl: ETH_ROPSTEN_EXPLORER_URL,
        hdPath: -2,
        builtin: true,
        isTestnet: true,
        balanceChecker: '0x8d9708f3f514206486d7e988533f770a16d074a7',
      },
    },
    {
      network: {
        name: ETH_RINKEBY_NAME,
        endpoint: ETH_RINKEBY_RPC_ENDPOINT,
        type: 'eth',
        chainId: ETH_RINKEBY_CHAINID,
        netId: ETH_RINKEBY_NETID,
        icon: 'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Ethereum.svg',
        cacheTime: 15000,

        ticker: {
          name: ETH_RINKEBY_CURRENCY_NAME,
          symbol: ETH_RINKEBY_CURRENCY_SYMBOL,
          decimals: DEFAULT_CURRENCY_DECIMALS,
          iconUrls: [
            'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/eth.svg',
          ],
        },
        scanUrl: ETH_RINKEBY_EXPLORER_URL,
        hdPath: -2,
        builtin: true,
        isTestnet: true,
        balanceChecker: '0x3183b673f4816c94bef53958baf93c671b7f8cf2',
      },
    },
    {
      network: {
        name: ETH_GOERLI_NAME,
        endpoint: ETH_GOERLI_RPC_ENDPOINT,
        type: 'eth',
        chainId: ETH_GOERLI_CHAINID,
        netId: ETH_GOERLI_NETID,
        icon: 'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Ethereum.svg',
        cacheTime: 15000,

        ticker: {
          name: ETH_GOERLI_CURRENCY_NAME,
          symbol: ETH_GOERLI_CURRENCY_SYMBOL,
          decimals: DEFAULT_CURRENCY_DECIMALS,
          iconUrls: [
            'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/eth.svg',
          ],
        },
        scanUrl: ETH_GOERLI_EXPLORER_URL,
        hdPath: -2,
        builtin: true,
        isTestnet: true,
        balanceChecker: '0x9788c4e93f9002a7ad8e72633b11e8d1ecd51f9b',
      },
    },
    {
      network: {
        name: ETH_KOVAN_NAME,
        endpoint: ETH_KOVAN_RPC_ENDPOINT,
        type: 'eth',
        chainId: ETH_KOVAN_CHAINID,
        netId: ETH_KOVAN_NETID,
        icon: 'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Ethereum.svg',
        cacheTime: 15000,

        ticker: {
          name: ETH_KOVAN_CURRENCY_NAME,
          symbol: ETH_KOVAN_CURRENCY_SYMBOL,
          decimals: DEFAULT_CURRENCY_DECIMALS,
          iconUrls: [
            'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/eth.svg',
          ],
        },
        scanUrl: ETH_KOVAN_EXPLORER_URL,
        hdPath: -2,
        builtin: true,
        isTestnet: true,
        balanceChecker: '0x55abba8d669d60a10c104cc493ec5ef389ec92bb',
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
