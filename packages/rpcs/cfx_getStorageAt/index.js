import {
  base32ContractAddress,
  Bytes32,
  epochRefNoMined,
  cat,
} from '@fluent-wallet/spec'

export const NAME = 'cfx_getStorageAt'

export const schemas = {
  input: [cat, base32ContractAddress, Bytes32, epochRefNoMined],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = ({f, params}) => {
  return f(params)
}
