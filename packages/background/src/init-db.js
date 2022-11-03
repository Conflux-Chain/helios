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
  ETH_GOERLI_RPC_ENDPOINT,
  ETH_GOERLI_NAME,
  ETH_GOERLI_CHAINID,
  ETH_GOERLI_NETID,
  ETH_GOERLI_CURRENCY_SYMBOL,
  ETH_GOERLI_CURRENCY_NAME,
  ETH_GOERLI_EXPLORER_URL,
  ETH_SEPOLIA_RPC_ENDPOINT,
  ETH_SEPOLIA_NAME,
  ETH_SEPOLIA_CHAINID,
  ETH_SEPOLIA_NETID,
  ETH_SEPOLIA_CURRENCY_SYMBOL,
  ETH_SEPOLIA_CURRENCY_NAME,
  ETH_SEPOLIA_EXPLORER_URL,
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
    {
      eid: -6,
      tokenList: {
        name: 'Fluent Default Conflux Espace List',
        url: 'https://cdn.jsdelivr.net/gh/conflux-fans/token-list/cfx-espace.fluent.json',
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
        tokenList: -6,
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
        gasBuffer: 1.5,
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
        gasBuffer: 1.5,
      },
    },
    {
      network: {
        name: ETH_SEPOLIA_NAME,
        endpoint: ETH_SEPOLIA_RPC_ENDPOINT,
        type: 'eth',
        chainId: ETH_SEPOLIA_CHAINID,
        netId: ETH_SEPOLIA_NETID,
        icon: 'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Ethereum.svg',
        cacheTime: 15000,

        ticker: {
          name: ETH_SEPOLIA_CURRENCY_NAME,
          symbol: ETH_SEPOLIA_CURRENCY_SYMBOL,
          decimals: DEFAULT_CURRENCY_DECIMALS,
          iconUrls: [
            'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/eth.svg',
          ],
        },
        scanUrl: ETH_SEPOLIA_EXPLORER_URL,
        hdPath: -2,
        builtin: true,
        isTestnet: true,
        // TODO(SEPOLIA) There is currently no balance call address for Sepolia
        balanceChecker: '',
        gasBuffer: 1.5,
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
