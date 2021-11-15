import {
  cat,
  base32UserAddress,
  base32ContractAddress,
  Uint,
  epochRefNoMined,
} from '@fluent-wallet/spec'

export const NAME = 'cfx_checkBalanceAgainstTransaction'

export const schemas = {
  input: [
    cat,
    base32UserAddress,
    base32ContractAddress,
    Uint, // gas
    Uint, // gasPrice
    Uint, // storageLimit
    epochRefNoMined,
  ],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  methods: [],
  db: [],
}

export const main = async ({f, params}) => {
  return await f(params)
}
