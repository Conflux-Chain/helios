import {cat, base32Address, epochRefNoMined} from '@fluent-wallet/spec'

export const NAME = 'cfx_getBalance'

export const schemas = {
  input: [cat, base32Address, epochRefNoMined],
}

export const cache = {
  type: 'epoch',
  key: ({params}) => `${NAME}${params[0]}`,
}

export const permissions = {
  locked: true,
  external: ['popup', 'inpage'],
}

export const main = async ({f, params}) => {
  return await f(params)
}
