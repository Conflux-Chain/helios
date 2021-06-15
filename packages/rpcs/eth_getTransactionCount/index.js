import {ethHexAddress, cat, blockTag} from '@cfxjs/spec'

export const NAME = 'eth_getTransactionCount'

export const schemas = {
  input: [cat, ethHexAddress, blockTag],
}

export const permissons = {
  locked: true,
}

export const main = async ({f, params}) => {
  return await f(params)
}
