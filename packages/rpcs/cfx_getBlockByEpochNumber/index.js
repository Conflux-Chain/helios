import {boolean, cat, epochRef} from '@fluent-wallet/spec'

export const NAME = 'cfx_getBlockByEpochNumber'

export const schemas = {
  input: [cat, epochRef, boolean],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const cache = {
  type: 'epoch',
  key: ({params}) => `${NAME}${params[1]}${params[2]}`,
}

export const main = ({f, params}) => {
  return f(params)
}
