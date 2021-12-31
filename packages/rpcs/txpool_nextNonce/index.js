import {base32UserAddress, cat} from '@fluent-wallet/spec'

export const NAME = 'txpool_nextNonce'

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
