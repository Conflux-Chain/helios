import {randomPrivateKey} from '@cfxjs/account'
import {or, nil, map, string, privateKey} from '@cfxjs/spec'

export const NAME = 'wallet_generatePrivateKey'

export const schemas = {
  input: [or, nil, [map, ['entropy', {optional: true}, string]]],
  output: privateKey,
}

export async function main({params: {entropy}} = {params: {}}) {
  return randomPrivateKey(entropy)
}
