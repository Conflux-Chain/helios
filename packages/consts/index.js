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
export const CONFLUX_MAINNET_RPC_ENDPOINT = 'https://portal-main.confluxrpc.com'
export const CFX_MAINNET_NAME = 'CFX_MAINNET'

export const CONFLUX_TESTNET_RPC_ENDPOINT = 'https://portal-test.confluxrpc.com'
export const CFX_TESTNET_NAME = 'CFX_TESTNET'

// TODO: setup ci to use own infura
export const ETH_MAINNET_RPC_ENDPOINT =
  'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
export const ETH_MAINNET_NAME = 'ETH_MAINNET'

export const ETH_ROPSTEN_RPC_ENDPOINT =
  'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
export const ETH_ROPSTEN_NAME = 'ETH_ROPSTEN'

export const BSC_MAINNET_RPC_ENDPOINT = 'https://bsc-dataseed.binance.org/'
export const BSC_MAINNET_NAME = 'BSC_MAINNET'

export const BSC_TESTNET_RPC_ENDPOINT =
  'https://data-seed-prebsc-1-s1.binance.org:8545/'
export const BSC_TESTNET_NAME = 'BSC_TESTNET'

export const DEFAULT_CFX_HDPATH = `m/44'/503'/0'/0`
export const DEFAULT_ETH_HDPATH = `m/44'/60'/0'/0`
