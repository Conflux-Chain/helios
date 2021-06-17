export const NAME = 'eth_blockNumber'

export const schemas = {}

export const permissions = {
  locked: true,
  external: ['popup', 'inpage'],
}

export const main = async ({f}) => {
  return await f()
}
