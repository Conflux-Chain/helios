import {
  cat,
  Uint,
  blockRef,
  or,
  zeroOrMore,
  number,
  string,
  schema,
} from '@fluent-wallet/spec'

export const NAME = 'eth_feeHistory'
export const schemas = {
  input: [
    cat,
    string,
    [or, blockRef, Uint],
    [schema, [zeroOrMore, [number, {max: 100, min: 1}]]],
  ],
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
