import {ethHexAddress, cat, blockTag} from '@fluent-wallet/spec'

export const NAME = 'eth_getCode'

export const schemas = {
  input: [cat, ethHexAddress, blockTag],
}

export const cache = {
  type: 'block',
  ttl: 3600,
  key: ({params}) => `${NAME}${params[0]}`,
}
export const permissions = {
  locked: true,
  external: ['popup', 'inpage'],
}

export const main = async ({f, params}) => {
  return await f(params)
}
