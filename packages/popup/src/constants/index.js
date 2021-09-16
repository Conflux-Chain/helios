export * from './rpcDeps'
export * as ROUTES from './route'

const LANGUAGES = ['en', 'zh-CN']
const PASSWORD_REG_EXP = /^(?=.*\d)(?=.*[a-zA-Z])[\da-zA-Z~!@#$%^&*]{8,16}$/
export {LANGUAGES, PASSWORD_REG_EXP}
