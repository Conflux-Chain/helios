import {arrp, empty, and} from '@fluent-wallet/spec'

export const NAME = 'net_version'

export const schemas = {
  input: [and, arrp, empty],
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
