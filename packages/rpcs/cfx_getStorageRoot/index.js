import {base32ContractAddress, cat, epochRefNoMined} from '@fluent-wallet/spec'

export const NAME = 'cfx_getStorageRoot'

export const schemas = {
  input: [cat, base32ContractAddress, epochRefNoMined],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = ({f, params}) => {
  return f(params)
}
