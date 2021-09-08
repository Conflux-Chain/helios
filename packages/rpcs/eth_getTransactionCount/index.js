import {ethHexAddress, cat, blockTag} from '@fluent-wallet/spec'

export const NAME = 'eth_getTransactionCount'

export const schemas = {
  input: [cat, ethHexAddress, blockTag],
}

export const permissions = {
  locked: true,
  external: ['popup', 'inpage'],
}

export const main = async ({f, params}) => {
  return await f(params)
}
