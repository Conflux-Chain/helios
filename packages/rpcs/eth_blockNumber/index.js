export const NAME = 'eth_blockNumber'

export const schemas = {}

export const permissons = {
  locked: true,
}

export const main = async ({f}) => {
  return await f()
}
