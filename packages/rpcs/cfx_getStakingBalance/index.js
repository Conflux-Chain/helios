import {cat, base32Address, epochRefNoMined} from '@fluent-wallet/spec'

export const NAME = 'cfx_getStakingBalance'

export const schemas = {
  input: [cat, base32Address, epochRefNoMined],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const cache = {
  type: 'epoch',
  key: ({params}) => `${NAME}${params[0]}`,
}

export const main = ({f, params}) => {
  return f(params)
}
