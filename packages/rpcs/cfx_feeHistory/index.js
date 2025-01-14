import {
  cat,
  epochRefNoMined,
  number,
  schema,
  string,
  zeroOrMore,
} from '@fluent-wallet/spec'

export const NAME = 'cfx_feeHistory'

export const schemas = {
  input: [
    cat,
    string,
    epochRefNoMined,
    [schema, [zeroOrMore, [number, {max: 100, min: 1}]]],
  ],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = ({f, params}) => {
  return f(params)
}
