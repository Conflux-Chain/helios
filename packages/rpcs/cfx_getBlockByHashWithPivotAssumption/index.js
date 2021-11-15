import {cat, Bytes32, Uint} from '@fluent-wallet/spec'

export const NAME = 'cfx_getBlockByHashWithPivotAssumption'

export const schemas = {
  input: [cat, Bytes32, Bytes32, Uint],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = ({f, params}) => {
  return f(params)
}
