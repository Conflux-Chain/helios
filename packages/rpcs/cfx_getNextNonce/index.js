import {base32UserAddress, cat, epochRefNoMined} from '@fluent-wallet/spec'

export const NAME = 'cfx_getNextNonce'

export const schemas = {
  input: [cat, base32UserAddress, epochRefNoMined],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const cache = {
  type: 'epoch',
  key: ({params}) => `${NAME}${params[0]}`,
}

export const main = async ({f, params}) => {
  return await f(params)
}
