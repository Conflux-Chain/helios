import {randomHex} from '@cfxjs/utils'
import {create as createAccount} from '@cfxjs/account'

export const NAME = 'wallet_generatePrivateKey'

export async function main({params: entropy}) {
  return createAccount(entropy || randomHex(32)).privateKey
}
