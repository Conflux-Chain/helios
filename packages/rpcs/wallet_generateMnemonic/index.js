import {generateMnemonic} from 'bip39'
import {mnemonic} from '@fluent-wallet/spec'

export const NAME = 'wallet_generateMnemonic'

export const schemas = {
  output: mnemonic,
}
export const permissions = {
  locked: true,
  external: ['popup'],
}

export const main = () => {
  return generateMnemonic()
}
