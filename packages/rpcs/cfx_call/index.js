import {
  cat,
  map,
  epochRef,
  base32UserAddress,
  base32ContractAddress,
  Uint,
  Bytes,
} from '@fluent-wallet/spec'

export const NAME = 'cfx_call'

export const cache = {
  type: 'epoch',
  key: ({params}) => {
    const req = params[0]
    return `${NAME}${JSON.stringify(req)}`
  },
}

export const schemas = {
  input: [
    cat,
    [
      map,
      {closed: true},
      ['from', {optional: true}, base32UserAddress],
      ['to', base32ContractAddress],
      ['storageLimit', {optional: true}, Uint],
      ['gasPrice', {optional: true}, Uint],
      ['gas', {optional: true}, Uint],
      ['value', {optional: true}, Uint],
      ['data', {optional: true}, Bytes],
      ['nonce', {optional: true}, Uint],
    ],
    epochRef,
  ],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = async ({f, params}) => {
  return await f(params)
}
