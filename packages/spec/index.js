export * from './src/spec.js'
import {defRestSchemas, defBase32AddressSchemaFactory} from './src/spec.js'

import {
  randomHexAddress,
  randomPrivateKey,
  validatePrivateKey,
} from '@cfxjs/account'
import {validateMnemonic, generateMnemonic} from 'bip39'
import {validateBase32Address, randomBase32Address} from '@cfxjs/base32-address'

export const {
  hexAddress,
  hexAccountAddress,
  hexContractAddress,
  mnemonic,
  privateKey,
} = defRestSchemas({
  validatePrivateKey,
  randomHexAddress,
  randomPrivateKey,
  validateMnemonic,
  generateMnemonic,
})

export const defBase32AddressSchema = (...args) => {
  return defBase32AddressSchemaFactory(
    validateBase32Address,
    randomBase32Address,
    ...args,
  )
}

export const base32AccountMainnetAddress = defBase32AddressSchema('user', 1029)
export const base32AccountTestnetAddress = defBase32AddressSchema('user', 1)
