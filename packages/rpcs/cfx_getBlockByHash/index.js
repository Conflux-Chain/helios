import {boolean, Bytes32, cat} from '@fluent-wallet/spec'

export const NAME = 'cfx_getBlockByHash'

export const schemas = {
  input: [cat, Bytes32, boolean],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const cache = {
  type: 'epoch',
  key: ({params}) => `${NAME}${params[0]}${params[1]}`,
}

export const main = ({f, params}) => {
  return f(params)
}
