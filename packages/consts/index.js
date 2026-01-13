/**
 * @fileOverview consts used in extension
 * @name index.js
 */

export const MAINNET = 'mainnet'
export const TESTNET = 'testnet'
export const LOCALHOST = 'localhost'
export const CUSTOM = 'custom'
export const EXT_STORAGE = 'ext-storage'
export const SIDE_PANEL_KEY = 'side-panel'
export const NULL_HEX_ADDRESS = '0x0000000000000000000000000000000000000000'
export const ADMINE_CONTROL_HEX_ADDRESS =
  '0x0888000000000000000000000000000000000000'
export const SPONSOR_WHITELIST_CONTROL_HEX_ADDRESS =
  '0x0888000000000000000000000000000000000001'
export const STAKING_HEX_ADDRESS = '0x0888000000000000000000000000000000000002'

export const INTERNAL_CONTRACTS_HEX_ADDRESS = [
  ADMINE_CONTROL_HEX_ADDRESS,
  SPONSOR_WHITELIST_CONTROL_HEX_ADDRESS,
  STAKING_HEX_ADDRESS,
]

export const ADDRESS_TYPES = ['user', 'contract', 'builtin', 'null']

// * network setting
export const DEFAULT_CURRENCY_DECIMALS = 18
export const CONFLUX_API_LIMIT_KEY = '1BvViQet4km8KPALkc6Pa9'
export const ETH_API_LIMIT_KEY = 'b6bf7d3508c941499b10025c0776eaf8'

export const CFX_MAINNET_RPC_ENDPOINT = `https://main.confluxrpc.com/${CONFLUX_API_LIMIT_KEY}`
export const CFX_MAINNET_NAME = 'Conflux Mainnet'
export const CFX_MAINNET_CHAINID = '0x405'
export const CFX_MAINNET_NETID = 1029
export const CFX_MAINNET_CURRENCY_SYMBOL = 'CFX'
export const CFX_MAINNET_CURRENCY_NAME = 'Conflux'
export const CFX_MAINNET_EXPLORER_URL = 'https://confluxscan.org'

export const CFX_ESPACE_MAINNET_RPC_ENDPOINT = `https://evm.confluxrpc.com/${CONFLUX_API_LIMIT_KEY}`
export const CFX_ESPACE_MAINNET_NAME = 'Conflux eSpace'
export const CFX_ESPACE_MAINNET_CHAINID = '0x406'
export const CFX_ESPACE_MAINNET_NETID = 1030
export const CFX_ESPACE_MAINNET_CURRENCY_SYMBOL = 'CFX'
export const CFX_ESPACE_MAINNET_CURRENCY_NAME = 'Conflux'
export const CFX_ESPACE_MAINNET_EXPLORER_URL = 'https://evm.confluxscan.org'

export const CFX_TESTNET_RPC_ENDPOINT = `https://test.confluxrpc.com/${CONFLUX_API_LIMIT_KEY}`
export const CFX_TESTNET_NAME = 'Conflux Testnet'
export const CFX_TESTNET_CHAINID = '0x1'
export const CFX_TESTNET_NETID = 1
export const CFX_TESTNET_CURRENCY_SYMBOL = 'CFX'
export const CFX_TESTNET_CURRENCY_NAME = 'Conflux'
export const CFX_TESTNET_EXPLORER_URL = 'https://testnet.confluxscan.org'

export const CFX_ESPACE_TESTNET_RPC_ENDPOINT = `https://evmtestnet.confluxrpc.com/${CONFLUX_API_LIMIT_KEY}`
export const CFX_ESPACE_TESTNET_NAME = 'eSpace Testnet'
export const CFX_ESPACE_TESTNET_CHAINID = '0x47'
export const CFX_ESPACE_TESTNET_NETID = 71
export const CFX_ESPACE_TESTNET_CURRENCY_SYMBOL = 'CFX'
export const CFX_ESPACE_TESTNET_CURRENCY_NAME = 'Conflux'
export const CFX_ESPACE_TESTNET_EXPLORER_URL =
  'https://evmtestnet.confluxscan.org'

export const ETH_MAINNET_RPC_ENDPOINT = `https://mainnet.infura.io/v3/${ETH_API_LIMIT_KEY}`
export const ETH_MAINNET_NAME = 'Ethereum Mainnet'
export const ETH_MAINNET_CHAINID = '0x1'
export const ETH_MAINNET_NETID = 1
export const ETH_MAINNET_CURRENCY_SYMBOL = 'ETH'
export const ETH_MAINNET_CURRENCY_NAME = 'Ether'
export const ETH_MAINNET_EXPLORER_URL = 'https://etherscan.io'

export const ETH_ROPSTEN_RPC_ENDPOINT = `https://ropsten.infura.io/v3/${ETH_API_LIMIT_KEY}`
export const ETH_ROPSTEN_NAME = 'Ethereum Ropsten'
export const ETH_ROPSTEN_CHAINID = '0x3'
export const ETH_ROPSTEN_NETID = 3
export const ETH_ROPSTEN_CURRENCY_SYMBOL = 'ETH'
export const ETH_ROPSTEN_CURRENCY_NAME = 'Ether'
export const ETH_ROPSTEN_EXPLORER_URL = 'https://ropsten.etherscan.io'

export const ETH_RINKEBY_RPC_ENDPOINT = `https://rinkeby.infura.io/v3/${ETH_API_LIMIT_KEY}`
export const ETH_RINKEBY_NAME = 'Ethereum Rinkeby'
export const ETH_RINKEBY_CHAINID = '0x4'
export const ETH_RINKEBY_NETID = 4
export const ETH_RINKEBY_CURRENCY_SYMBOL = 'ETH'
export const ETH_RINKEBY_CURRENCY_NAME = 'Ether'
export const ETH_RINKEBY_EXPLORER_URL = 'https://rinkeby.etherscan.io'

export const ETH_KOVAN_RPC_ENDPOINT = `https://kovan.infura.io/v3/${ETH_API_LIMIT_KEY}`
export const ETH_KOVAN_NAME = 'Ethereum Kovan'
export const ETH_KOVAN_CHAINID = '0x2a'
export const ETH_KOVAN_NETID = 42
export const ETH_KOVAN_CURRENCY_SYMBOL = 'ETH'
export const ETH_KOVAN_CURRENCY_NAME = 'Ether'
export const ETH_KOVAN_EXPLORER_URL = 'https://kovan.etherscan.io'

export const ETH_GOERLI_RPC_ENDPOINT = `https://goerli.infura.io/v3/${ETH_API_LIMIT_KEY}`
export const ETH_GOERLI_NAME = 'Ethereum Goerli'
export const ETH_GOERLI_CHAINID = '0x5'
export const ETH_GOERLI_NETID = 5
export const ETH_GOERLI_CURRENCY_SYMBOL = 'GoerliETH'
export const ETH_GOERLI_CURRENCY_NAME = 'Ether'
export const ETH_GOERLI_EXPLORER_URL = 'https://goerli.etherscan.io'

export const ETH_SEPOLIA_RPC_ENDPOINT = `https://sepolia.infura.io/v3/${ETH_API_LIMIT_KEY}`
export const ETH_SEPOLIA_NAME = 'Ethereum Sepolia'
export const ETH_SEPOLIA_CHAINID = '0xaa36a7'
export const ETH_SEPOLIA_NETID = 11155111
export const ETH_SEPOLIA_CURRENCY_SYMBOL = 'SepoliaETH'
export const ETH_SEPOLIA_CURRENCY_NAME = 'Ether'
export const ETH_SEPOLIA_EXPLORER_URL = 'https://sepolia.etherscan.io'

export const DEFAULT_CFX_HDPATH = `m/44'/503'/0'/0`
export const DEFAULT_ETH_HDPATH = `m/44'/60'/0'/0`

// for ledger import address path
export const LEDGER_LIVE_PATH = `m/44'/60'/0'/0/0`
// for MEW or MyCrypto import address path
export const MEW_PATH = `m/44'/60'/0'`

export const REGENERATE = 'REGENERATE'

export const CFX_LOCALNET_RPC_ENDPOINT = 'http://localhost:12537'
export const CFX_LOCALNET_NAME = 'CFX_LOCALNET'
export const CFX_LOCALNET_CHAINID = '0xbb7'
export const CFX_LOCALNET_NETID = 2999
export const CFX_LOCALNET_CURRENCY_SYMBOL = 'CFX'
export const CFX_LOCALNET_CURRENCY_NAME = 'CFX'

export const ETH_LOCALNET_RPC_ENDPOINT = 'http://localhost:8545'
export const ETH_LOCALNET_NAME = 'ETH_LOCALNET'
export const ETH_LOCALNET_CHAINID = '0x539'
export const ETH_LOCALNET_NETID = 1337
export const ETH_LOCALNET_CURRENCY_SYMBOL = 'ETH'
export const ETH_LOCALNET_CURRENCY_NAME = 'Ether'

export const CFX_SCAN_DOMAINS = {
  [CFX_MAINNET_NETID]: 'https://confluxscan.org',
  [CFX_TESTNET_NETID]: 'https://testnet.confluxscan.org',
}

export const ETH_SCAN_DOMAINS = {
  [ETH_MAINNET_NETID]: 'https://etherscan.io/',
  [CFX_TESTNET_NETID]: 'https://ropsten.etherscan.io/',
}

export const CFX_SCAN_API_ENDPOINTS = {
  [CFX_MAINNET_NETID]: 'https://api.confluxscan.org/',
  [CFX_TESTNET_NETID]: 'https://api-testnet.confluxscan.org/',
  [CFX_ESPACE_MAINNET_NETID]: 'https://evmapi.confluxscan.org/',
  [CFX_ESPACE_TESTNET_NETID]: 'https://evmapi-testnet.confluxscan.org/',
}

export const ETH_TX_TYPES = {
  LEGACY: '0x0',
  EIP2930: '0x1',
  EIP1559: '0x2',
}
