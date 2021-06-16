import {ethHexAddress, cat, blockTag} from '@cfxjs/spec'

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
}

export const main = async ({f, params}) => {
  return await f(params)
}
