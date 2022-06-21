import {
  cat,
  Uint,
  blockRef,
  or,
  zeroOrMore,
  number,
  schema,
} from '@fluent-wallet/spec'

export const NAME = 'eth_feeHistory'
export const schemas = {
  input: [
    cat,
    number,
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
