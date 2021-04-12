export * from './src/spec.js' // eslint-disable-line import/export
import {INTERNAL_CONTRACTS_HEX_ADDRESS, NULL_HEX_ADDRESS} from 'consts'

import {
  defRestSchemas,
  defBase32AddressSchemaFactory,
  or,
  integer,
} from './src/spec.js'

import {
  randomHexAddress,
  randomCfxHexAddress,
  randomPrivateKey,
  validatePrivateKey,
} from '@cfxjs/account'
import {validateMnemonic, generateMnemonic} from 'bip39'
import {validateBase32Address, randomBase32Address} from '@cfxjs/base32-address'

export const {
  ethHexAddress,
  hexAccountAddress,
  hexContractAddress,
  hexBuiltInAddress,
  hexNullAddress,
  mnemonic,
  privateKey,
} = defRestSchemas({
  INTERNAL_CONTRACTS_HEX_ADDRESS,
  NULL_HEX_ADDRESS,
  validatePrivateKey,
  randomHexAddress,
  randomCfxHexAddress,
  randomPrivateKey,
  validateMnemonic,
  generateMnemonic,
})

export const cfxHexAddress = [
  or,
  hexAccountAddress,
  hexContractAddress,
  hexBuiltInAddress,
  hexNullAddress,
]

export const defBase32AddressSchema = (...args) => {
  return defBase32AddressSchemaFactory(
    validateBase32Address,
    randomBase32Address,
    ...args,
  )
}

export const dbid = integer
export const base32AccountMainnetAddress = defBase32AddressSchema('user', 1029)
export const base32AccountTestnetAddress = defBase32AddressSchema('user', 1)
