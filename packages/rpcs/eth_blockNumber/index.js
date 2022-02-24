import {optParam} from '@fluent-wallet/spec'

export const NAME = 'eth_blockNumber'

export const schemas = {
  input: optParam,
}

export const permissions = {
  locked: true,
  external: ['popup', 'inpage'],
}

export const cache = {
  type: 'ttl',
  key: () => NAME,
}

export const main = async ({f}) => {
  return await f([])
}
