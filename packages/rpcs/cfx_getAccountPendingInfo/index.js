import {cat, base32UserAddress} from '@fluent-wallet/spec'

export const NAME = 'cfx_getAccountPendingInfo'

export const schemas = {
  input: [cat, base32UserAddress],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = ({f, params}) => {
  return f(params)
}
