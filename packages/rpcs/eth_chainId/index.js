import {optParam} from '@fluent-wallet/spec'

export const NAME = 'eth_chainId'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const cache = {
  type: 'ttl',
  ttl: 24 * 60 * 60 * 1000,
  key: () => NAME,
}

export const main = async ({f, params}) => {
  return await f(params)
}
