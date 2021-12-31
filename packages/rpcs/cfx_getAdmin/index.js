import {base32ContractAddress, cat, epochRefNoMined} from '@fluent-wallet/spec'

export const NAME = 'cfx_getAdmin'

export const schemas = {
  input: [cat, base32ContractAddress, epochRefNoMined],
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
