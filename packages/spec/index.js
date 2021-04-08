export * from './src/spec.js' // eslint-disable-line import/export
import {dissocObj} from '@cfxjs/associative'

import {
  defRestSchemas,
  defBase32AddressSchemaFactory,
  explain as explaincljs,
} from './src/spec.js'

import {
  randomHexAddress,
  randomPrivateKey,
  validatePrivateKey,
} from '@cfxjs/account'
import {validateMnemonic, generateMnemonic} from 'bip39'
import {validateBase32Address, randomBase32Address} from '@cfxjs/base32-address'

const dissocObjSchema = obj => dissocObj(obj, ['schema'])

// eslint-disable-next-line import/export
export const explain = (...args) => {
  const explanation = explaincljs(...args)
  explanation.errors = explanation.errors.map(dissocObjSchema)
  return dissocObjSchema(explanation)
}

export const {
  hexAddress,
  hexAccountAddress,
  hexContractAddress,
  hexBuiltInAddress,
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
