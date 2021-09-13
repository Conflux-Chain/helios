import {cat, ethHexAddress, blockRef} from '@fluent-wallet/spec'

export const NAME = 'eth_getBalance'

export const schemas = {
  input: [cat, ethHexAddress, blockRef],
}

export const permissions = {
  locked: true,
  external: ['popup', 'inpage'],
}

export const main = async ({f, params}) => {
  return await f(params)
}
