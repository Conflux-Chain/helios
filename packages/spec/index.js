export * from './src/spec.js' // eslint-disable-line import/export
import {
  INTERNAL_CONTRACTS_HEX_ADDRESS,
  NULL_HEX_ADDRESS,
} from '@cfxjs/fluent-wallet-consts'

import {
  defRestSchemas,
  defBase32AddressSchemaFactory,
  or,
  posInt,
} from './src/spec.js'

import {
  randomHexAddress,
  randomCfxHexAddress,
  randomPrivateKey,
  validatePrivateKey,
} from '@cfxjs/account'
import {validateMnemonic, generateMnemonic} from 'bip39'
import {validateBase32Address, randomBase32Address} from '@cfxjs/base32-address'
import {randomHDPath, validateHDPath} from '@cfxjs/hdkey'

export const {
  ethHexAddress,
  hexUserAddress,
  hexContractAddress,
  hexBuiltInAddress,
  hexNullAddress,
  mnemonic,
  privateKey,
  hdPath,
} = defRestSchemas({
  INTERNAL_CONTRACTS_HEX_ADDRESS,
  NULL_HEX_ADDRESS,
  validatePrivateKey,
  randomHexAddress,
  randomCfxHexAddress,
  randomPrivateKey,
  validateMnemonic,
  generateMnemonic,
  validateHDPath,
  randomHDPath,
})

export const cfxHexAddress = [
  or,
  hexUserAddress,
  hexContractAddress,
  hexBuiltInAddress,
  hexNullAddress,
]

export const [
  base32Address,
  base32UserAddress,
  base32ContractAddress,
  base32BuiltinAddress,
  base32NullAddress,
] = defBase32AddressSchemaFactory(validateBase32Address, randomBase32Address)

export const dbid = posInt
