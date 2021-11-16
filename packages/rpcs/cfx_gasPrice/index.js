import {optParam} from '@fluent-wallet/spec'

export const NAME = 'cfx_gasPrice'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const cache = {
  type: 'ttl',
  key: () => NAME,
}

export const main = async ({f}) => {
  return await f()
}
