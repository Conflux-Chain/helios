import {cat, epochRef} from '@fluent-wallet/spec'

export const NAME = 'cfx_getBlocksByEpoch'

export const schemas = {
  input: [cat, epochRef],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const cache = {
  type: 'epoch',
  key: () => NAME,
}

export const main = ({f, params}) => {
  return f(params)
}
