import {or, cat, Uint, boolean, blockRef} from '@fluent-wallet/spec'

export const NAME = 'eth_getBlockByNumber'

export const schemas = {
  input: [cat, [or, blockRef, Uint], boolean],
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
