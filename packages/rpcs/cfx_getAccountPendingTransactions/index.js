import {cat, zeroOrOne, base32UserAddress, Uint} from '@fluent-wallet/spec'

export const NAME = 'cfx_getAccountPendingTransactions'

export const schemas = {
  input: [
    cat,
    base32UserAddress,
    [zeroOrOne, {doc: 'Optional start nonce to return'}, Uint],
    [
      zeroOrOne,
      {doc: 'Optional limit of pending transactions to return'},
      Uint,
    ],
  ],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = ({f, params}) => {
  return f(params)
}
