import {
  cat,
  base32UserAddress,
  base32ContractAddress,
  Uint,
  epochRef,
  zeroOrOne,
} from '@fluent-wallet/spec'

export const NAME = 'cfx_checkBalanceAgainstTransaction'

export const schemas = {
  input: [
    cat,
    base32UserAddress,
    base32ContractAddress,
    Uint,
    Uint,
    Uint,
    [zeroOrOne, epochRef],
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
