import {randomPrivateKey} from '@cfxjs/account'
import {or, nul, map, string, privateKey} from '@cfxjs/spec'

export const NAME = 'wallet_generatePrivateKey'

export const schemas = {
  input: [or, nul, [map, ['entropy', {optional: true}, string]]],
  output: privateKey,
}

export async function main({params: {entropy}} = {params: {}}) {
  return randomPrivateKey(entropy)
}
