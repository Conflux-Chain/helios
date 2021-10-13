import {
  CONNECT_SITE,
  CONFIRM_ADD_SUGGESTED_TOKEN,
  REQUEST_SIGNATURE,
  DAPP_ADD_NETWORK,
  DAPP_SWITCH_NETWORK,
} from './route'

export * as RPC_METHODS from './rpcMethods'
export * as ROUTES from './route'
export const LANGUAGES = ['en', 'zh-CN']
export const ANIMATE_DURING_TIME = 300
export const PASSWORD_REG_EXP =
  /^(?=.*\d)(?=.*[a-zA-Z])[\da-zA-Z~!@#$%^&*]{8,16}$/
export const NETWORK_TYPE = {
  CFX: 'cfx',
  ETH: 'eth',
}

export const DAPP_REQUEST_ROUTES = {
  wallet_requestPermissions: CONNECT_SITE,
  personal_sign: '',
  cfx_signTypedData_v4: REQUEST_SIGNATURE,
  wallet_switchConfluxChain: DAPP_SWITCH_NETWORK,
}
