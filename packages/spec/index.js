export * from './src/spec.js' // eslint-disable-line import/export
import {
  INTERNAL_CONTRACTS_HEX_ADDRESS,
  NULL_HEX_ADDRESS,
} from '@cfxjs/fluent-wallet-consts'

import {
  hex,
  defRestSchemas,
  defBase32AddressSchemaFactory,
  or,
  integer,
  enums,
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

export const defBase32AddressSchema = (...args) => {
  return defBase32AddressSchemaFactory(
    validateBase32Address,
    randomBase32Address,
    ...args,
  )
}

export const epoch = [
  [
    enums,
    'latest_mined',
    'latest_state',
    'latest_confirmed',
    'latest_checkpoint',
    'earliest',
    hex,
    null,
  ],
  {
    doc: 'See the doc for epoch number parameter https://developer.conflux-chain.org/conflux-doc/docs/json_rpc/#the-epoch-number-parameter',
  },
]

export const dbid = integer
export const base32AccountMainnetAddress = defBase32AddressSchema('user', 1029)
export const base32AccountTestnetAddress = defBase32AddressSchema('user', 1)
