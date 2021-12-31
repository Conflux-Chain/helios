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

export const cache = {
  type: 'epoch',
  key: ({params}) =>
    `${NAME}${params[0]}${params[1]}${params[2]}${params[3]}${params[4]}`,
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
