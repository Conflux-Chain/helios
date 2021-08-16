import {and, arrp, empty} from '@cfxjs/spec'

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
  ttl: 1000, // TODO: block time of each eth-type network is different
}

export const main = async ({f, params}) => {
  return await f(params)
}
