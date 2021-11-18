import {and, arrp, empty} from '@fluent-wallet/spec'

export const NAME = 'eth_blockNumber'

export const schemas = {
  input: [and, arrp, empty],
}

export const permissions = {
  locked: true,
  external: ['popup', 'inpage'],
}

export const cache = {
  type: 'ttl',
  key: ({params}) => `EPOCH${params[0]}`,
}

export const main = async ({f, params}) => {
  return await f(params)
}
