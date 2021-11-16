import {cat, base32Address, epochRefNoMined} from '@fluent-wallet/spec'

export const NAME = 'cfx_getBalance'

export const schemas = {
  input: [cat, base32Address, epochRefNoMined],
}

export const permissions = {
  locked: true,
  external: ['popup', 'inpage'],
}

export const main = async ({f, params}) => {
  return await f(params)
}
