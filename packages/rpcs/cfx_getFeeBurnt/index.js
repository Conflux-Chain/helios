import {optParam} from '@fluent-wallet/spec'

export const NAME = 'cfx_getFeeBurnt'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export function main({f}) {
  return f()
}
