import {generateMnemonic} from 'bip39'

export const NAME = 'wallet_generateMnemonic'

export const main = () => {
  return generateMnemonic()
}
