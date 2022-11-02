import langResources from '../locales'
import {
  CFX_MAINNET_RPC_ENDPOINT,
  CFX_ESPACE_MAINNET_RPC_ENDPOINT,
  CFX_TESTNET_RPC_ENDPOINT,
  CFX_ESPACE_TESTNET_RPC_ENDPOINT,
  ETH_MAINNET_RPC_ENDPOINT,
  ETH_GOERLI_RPC_ENDPOINT,
  ETH_KOVAN_RPC_ENDPOINT,
} from '@fluent-wallet/consts'
import {
  CONNECT_SITE,
  DAPP_ADD_TOKEN,
  REQUEST_SIGNATURE,
  DAPP_ADD_NETWORK,
  DAPP_SWITCH_NETWORK,
  CONFIRM_TRANSACTION,
  CONNECT_HARDWARE_WALLET,
  IMPORT_HW_ACCOUNT,
} from './route'
import {
  WALLET_REQUEST_PERMISSIONS,
  CFX_SIGN_TYPED_DATA_V4,
  ETH_SIGN_TYPED_DATA_V4,
  WALLET_SWITCH_CONFLUX_CHAIN,
  WALLET_SWITCH_ETHEREUM_CHAIN,
  WALLET_ADD_ETHEREUM_CHAIN,
  WALLET_ADD_CONFLUX_CHAIN,
  WALLET_WATCH_ASSET,
  CFX_SEND_TRANSACTION,
  ETH_SEND_TRANSACTION,
  PERSONAL_SIGN,
  WALLET_SEND_TRANSACTION,
} from './rpcMethods'
export * as RPC_METHODS from './rpcMethods'
export * as ROUTES from './route'
export const LANGUAGES = Object.keys(langResources || {})
export const ANIMATE_DURING_TIME = 300
export const PASSWORD_REG_EXP = /^(?=.*\d)(?=.*[a-zA-Z]).{8,128}$/
export const NETWORK_TYPE = {
  CFX: 'cfx',
  ETH: 'eth',
}

export const DAPP_REQUEST_ROUTES = {
  [WALLET_REQUEST_PERMISSIONS]: CONNECT_SITE,
  [CFX_SIGN_TYPED_DATA_V4]: REQUEST_SIGNATURE,
  [ETH_SIGN_TYPED_DATA_V4]: REQUEST_SIGNATURE,
  [PERSONAL_SIGN]: REQUEST_SIGNATURE,
  [WALLET_SWITCH_CONFLUX_CHAIN]: DAPP_SWITCH_NETWORK,
  [WALLET_SWITCH_ETHEREUM_CHAIN]: DAPP_SWITCH_NETWORK,
  [WALLET_ADD_ETHEREUM_CHAIN]: DAPP_ADD_NETWORK,
  [WALLET_ADD_CONFLUX_CHAIN]: DAPP_ADD_NETWORK,
  [WALLET_WATCH_ASSET]: DAPP_ADD_TOKEN,
  [CFX_SEND_TRANSACTION]: CONFIRM_TRANSACTION,
  [ETH_SEND_TRANSACTION]: CONFIRM_TRANSACTION,
  [WALLET_SEND_TRANSACTION]: CONFIRM_TRANSACTION,
}

export const DEFAULT_TOKEN_URL =
  'https://conflux-static.oss-cn-beijing.aliyuncs.com/fluent/icons/default-token-icon.svg'

export const PAGE_LIMIT = 10

export const LEDGER_AUTH_STATUS = {
  LOADING: 'loading',
  AUTHED: 'authed',
  UNAUTHED: 'unauthed',
}
export const LEDGER_OPEN_STATUS = {
  LOADING: 'loading',
  OPEN: 'open',
  UNOPEN: 'unopen',
}

export const TX_STATUS = {
  HW_WAITING: 'hw_waiting', // only used for ledger account
  HW_SUCCESS: 'hw_success', // only used for ledger account
  ERROR: 'error', // used for all accounts
}

export const HARDWARE_ACCOUNT_PAGE_LIMIT = 5

export const FULL_WINDOW_ROUTES = [CONNECT_HARDWARE_WALLET, IMPORT_HW_ACCOUNT]

export const MAX_PENDING_COUNT = 9

export const MULTI_ADDRESS_PERMISSIONS = {
  cfx: 'wallet_crossNetworkTypeGetEthereumHexAddress',
  eth: 'wallet_crossNetworkTypeGetConfluxBase32Address',
}

export const BUILTIN_NETWORK_ENDPOINTS = {
  'Conflux Mainnet': CFX_MAINNET_RPC_ENDPOINT,
  'Conflux eSpace': CFX_ESPACE_MAINNET_RPC_ENDPOINT,
  'Ethereum Mainnet': ETH_MAINNET_RPC_ENDPOINT,
  'Conflux Testnet': CFX_TESTNET_RPC_ENDPOINT,
  'eSpace Testnet': CFX_ESPACE_TESTNET_RPC_ENDPOINT,
  'Ethereum Ropsten':
    'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  'Ethereum Rinkeby':
    'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  'Ethereum Goerli': ETH_GOERLI_RPC_ENDPOINT,
  'Ethereum Kovan': ETH_KOVAN_RPC_ENDPOINT,
}
