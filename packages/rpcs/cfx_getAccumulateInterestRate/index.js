import {cat, epochRefNoMined} from '@fluent-wallet/spec'

export const NAME = 'cfx_getAccumulateInterestRate'

export const schemas = {
  input: [cat, epochRefNoMined],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = ({f, params}) => {
  return f(params)
}
