import {nul} from '@cfxjs/spec'

export const NAME = 'cfx_gasPrice'

export const schemas = {
  inputs: [nul],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const cache = {
  type: 'ttl',
  ttl: 100000,
  key: NAME,
}

export const main = async ({f}) => {
  return await f()
}
