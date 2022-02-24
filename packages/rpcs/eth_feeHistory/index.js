import {
  cat,
  Uint,
  blockRef,
  or,
  gte,
  lte,
  zeroOrMore,
  and,
  number,
} from '@fluent-wallet/spec'

export const NAME = 'eth_feeHistory'

export const schemas = {
  input: [
    cat,
    Uint,
    [or, blockRef, Uint],
    [zeroOrMore, [and, number, [gte, 0], [lte, 100]]],
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
