import {arrp, empty, and} from '@cfxjs/spec'

export const NAME = 'eth_gasPrice'

export const schemas = {
  input: [and, arrp, empty],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = async ({f, params}) => {
  return await f(params)
}
