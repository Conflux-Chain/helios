import {randomPrivateKey} from '@fluent-wallet/account'
import {optParam, privateKey} from '@fluent-wallet/spec'

export const NAME = 'wallet_generatePrivateKey'

export const schemas = {
  input: optParam,
  output: privateKey,
}
export const permissions = {
  locked: true,
  external: ['popup', 'inpage'],
}

export async function main() {
  return randomPrivateKey()
}
