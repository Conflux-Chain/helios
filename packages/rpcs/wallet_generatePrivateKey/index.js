import {randomPrivateKey} from '@cfxjs/account'
import {nul, or, and, empty, arrp, privateKey} from '@cfxjs/spec'

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
