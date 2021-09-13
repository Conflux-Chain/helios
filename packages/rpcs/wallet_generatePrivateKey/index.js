import {randomPrivateKey} from '@fluent-wallet/account'
import {nul, or, and, empty, arrp, privateKey} from '@fluent-wallet/spec'

export const NAME = 'wallet_generatePrivateKey'

export const schemas = {
  input: [or, nul, [and, arrp, empty]],
  output: privateKey,
}
export const permissions = {
  locked: true,
  external: ['popup', 'inpage'],
}

export async function main() {
  return randomPrivateKey()
}
