import {stringp} from './src/spec.js'
export * from './src/spec.js' // eslint-disable-line import/export
import {
  INTERNAL_CONTRACTS_HEX_ADDRESS,
  NULL_HEX_ADDRESS,
} from '@fluent-wallet/consts'

import {defRestSchemas, defBase32AddressSchemaFactory, or} from './src/spec.js'

import {
  isChecksummed,
  randomHexAddress,
  randomCfxHexAddress,
  randomPrivateKey,
  validatePrivateKey,
} from '@fluent-wallet/account'
import {validateMnemonic, generateMnemonic} from 'bip39'
import {
  validateBase32Address,
  randomBase32Address,
} from '@fluent-wallet/base32-address'
import {randomHDPath, validateHDPath} from '@fluent-wallet/hdkey'

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
  isChecksummed,
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

export const nickname = [
  stringp,
  {
    min: 1,
    max: 20,
    doc: 'Nickname of this account, a string with 1 to 20 characters',
  },
]

export const optionalMapKey = s => {
  if (s.length === 3) {
    const [k, opt, v] = s
    return [k, {...opt, optional: true}, v]
  }
  if (s.length === 2) {
    const [k, v] = s
    return [k, {optional: true}, v]
  }

  throw new Error('unsupported spec')
}
