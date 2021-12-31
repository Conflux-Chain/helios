import {gen} from '@fluent-wallet/cfx_sign-typed-data_v4'
export {permissions} from '@fluent-wallet/cfx_sign-typed-data_v4'

export const NAME = 'eth_signTypedData_v4'
export const schemas = gen.schemas('eth')
export const main = gen.main('eth')
