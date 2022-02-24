import {Bytes32, cat} from '@fluent-wallet/spec'

export const NAME = 'eth_getTransactionReceipt'

export const schemas = {
  input: [cat, Bytes32],
}

export const cache = {
  type: 'block',
  key: ({params}) => `${NAME}${params[0]}`,
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  methods: [],
  db: [],
}

export const main = ({f, params}) => {
  return f(params)
}
