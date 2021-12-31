import {Bytes32, cat} from '@fluent-wallet/spec'

export const NAME = 'cfx_getTransactionByHash'

export const schemas = {
  input: [cat, Bytes32],
}

export const cache = {
  type: 'epoch',
  key: ({params}) => `${NAME}${params[0]}`,
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = ({f, params}) => {
  return f(params)
}
