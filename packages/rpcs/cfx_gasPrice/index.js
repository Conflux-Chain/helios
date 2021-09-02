import {nul} from '@cfxjs/spec'

export const NAME = 'cfx_gasPrice'

export const schemas = {
  input: [nul],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = async ({f}) => {
  return await f()
}
