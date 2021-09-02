/**
 * @fileOverview consts used in extension
 * @name index.js
 */

export const MAINNET = 'mainnet'
export const TESTNET = 'testnet'
export const LOCALHOST = 'localhost'
export const CUSTOM = 'custom'
export const EXT_STORAGE = 'ext-storage'
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

export const CFX_MAINNET_RPC_ENDPOINT = 'https://portal-main.confluxrpc.com'
export const CFX_MAINNET_NAME = 'CFX_MAINNET'
export const CFX_MAINNET_CHAINID = '0x405'
export const CFX_MAINNET_NETID = 1029
export const CFX_MAINNET_CURRENCY_SYMBOL = 'CFX'
export const CFX_MAINNET_CURRENCY_NAME = 'CFX'

export const CFX_TESTNET_RPC_ENDPOINT = 'https://portal-test.confluxrpc.com'
export const CFX_TESTNET_NAME = 'CFX_TESTNET'
export const CFX_TESTNET_CHAINID = '0x1'
export const CFX_TESTNET_NETID = 1
export const CFX_TESTNET_CURRENCY_SYMBOL = 'CFX'
export const CFX_TESTNET_CURRENCY_NAME = 'CFX'

// TODO: setup ci to use own infura
export const ETH_MAINNET_RPC_ENDPOINT =
  'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
export const ETH_MAINNET_NAME = 'ETH_MAINNET'
export const ETH_MAINNET_CHAINID = '0x1'
export const ETH_MAINNET_NETID = 1
export const ETH_MAINNET_CURRENCY_SYMBOL = 'ETH'
export const ETH_MAINNET_CURRENCY_NAME = 'Ether'

export const ETH_ROPSTEN_RPC_ENDPOINT =
  'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
export const ETH_ROPSTEN_NAME = 'ETH_ROPSTEN'
export const ETH_ROPSTEN_CHAINID = '0x3'
export const ETH_ROPSTEN_NETID = 3
export const ETH_ROPSTEN_CURRENCY_SYMBOL = 'ETH'
export const ETH_ROPSTEN_CURRENCY_NAME = 'Ether'

export const BSC_MAINNET_RPC_ENDPOINT = 'https://bsc-dataseed.binance.org/'
export const BSC_MAINNET_NAME = 'BSC_MAINNET'
export const BSC_MAINNET_CHAINID = '0x38'
export const BSC_MAINNET_NETID = 56
export const BSC_MAINNET_CURRENCY_SYMBOL = 'BNB'
export const BSC_MAINNET_CURRENCY_NAME = 'BNB'

export const BSC_TESTNET_RPC_ENDPOINT =
  'https://data-seed-prebsc-1-s1.binance.org:8545/'
export const BSC_TESTNET_NAME = 'BSC_TESTNET'
export const BSC_TESTNET_CHAINID = '0x61'
export const BSC_TESTNET_NETID = 97
export const BSC_TESTNET_CURRENCY_SYMBOL = 'BNB'
export const BSC_TESTNET_CURRENCY_NAME = 'BNB'

export const DEFAULT_CFX_HDPATH = `m/44'/503'/0'/0`
export const DEFAULT_ETH_HDPATH = `m/44'/60'/0'/0`

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
