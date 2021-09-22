export * as RPC_METHODS from './rpcMethods'
export * as ROUTES from './route'

const LANGUAGES = ['en', 'zh-CN']
const ANIMATE_DURING_TIME = 300
const PASSWORD_REG_EXP = /^(?=.*\d)(?=.*[a-zA-Z])[\da-zA-Z~!@#$%^&*]{8,16}$/
export {LANGUAGES, PASSWORD_REG_EXP, ANIMATE_DURING_TIME}

export const NETWORK_TYPE = {
  CFX: 'cfx',
  ETH: 'eth',
}
