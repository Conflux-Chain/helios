import {create as createAccount} from '@cfxjs/account'

export const NAME = 'wallet_generatePrivateKey'

export async function main({params: entropy}) {
  return createAccount(entropy).privateKey
}
