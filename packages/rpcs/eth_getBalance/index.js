import {cat, ethHexAddress, blockRef} from '@cfxjs/spec'

export const NAME = 'eth_getBalance'

export const schemas = {
  input: [cat, ethHexAddress, blockRef],
}

export const main = async ({f, params}) => {
  return await f(params)
}
