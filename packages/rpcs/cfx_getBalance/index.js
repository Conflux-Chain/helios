import {cat, base32Address, epochRef} from '@cfxjs/spec'

export const NAME = 'cfx_getBalance'

export const schemas = {
  input: [cat, base32Address, epochRef],
}

export const main = async ({f, params}) => {
  return await f(params)
}
