import {create as createAccount} from '@cfxjs/account'
import {or, nil, map, string, optional} from '@cfxjs/spec'

export const NAME = 'wallet_generatePrivateKey'

export const schemas = {
  input: [or, nil, [map, ['entropy', optional, string]]],
}

export async function main({params: {entropy}}) {
  return createAccount(entropy).privateKey
}
