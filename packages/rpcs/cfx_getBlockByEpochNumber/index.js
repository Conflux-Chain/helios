import {boolean, cat, epochRef} from '@fluent-wallet/spec'

export const NAME = 'cfx_getBlockByEpochNumber'

export const schemas = {
  input: [cat, epochRef, boolean],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = ({f, params}) => {
  return f(params)
}
