export * from './src/spec.js' // eslint-disable-line import/export
import {
  INTERNAL_CONTRACTS_HEX_ADDRESS,
  NULL_HEX_ADDRESS,
} from '@cfxjs/fluent-wallet-consts'

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

const Base32AddressSchemaCache = new Map()

export const defBase32AddressSchema = (...args) => {
  let schema = Base32AddressSchemaCache.get(args)
  if (schema) return schema

  schema = defBase32AddressSchemaFactory(
    validateBase32Address,
    randomBase32Address,
    ...args,
  )
  Base32AddressSchemaCache.set(args, schema)
  return schema
}

export const dbid = integer
export const base32AccountMainnetAddress = defBase32AddressSchema('user', 1029)
export const base32AccountTestnetAddress = defBase32AddressSchema('user', 1)
export const base32Address = defBase32AddressSchema()
export const base32AccountAddress = defBase32AddressSchema('user')
export const base32ContractAddress = defBase32AddressSchema('contract')
export const base32BuiltInAddress = defBase32AddressSchema('builtin')
