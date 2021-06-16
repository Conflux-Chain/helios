import {base32UserAddress, cat, epochRef} from '@cfxjs/spec'

export const NAME = 'cfx_getNextNonce'

export const schemas = {
  input: [cat, base32UserAddress, epochRef],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = async ({f, params}) => {
  return await f(params)
}
