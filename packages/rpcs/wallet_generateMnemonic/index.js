import {generateMnemonic} from 'bip39'
import {mnemonic} from '@cfxjs/spec'

export const NAME = 'wallet_generateMnemonic'

export const schemas = {
  output: mnemonic,
}

export const main = () => {
  return generateMnemonic()
}
