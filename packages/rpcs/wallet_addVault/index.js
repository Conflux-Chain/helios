import {
  or,
  map,
  mnemonic,
  privateKey,
  base32AccountMainnetAddress,
  base32AccountTestnetAddress,
  ethHexAddress,
  password,
} from '@cfxjs/spec'
import {encrypt, decrypt} from 'browser-passworder'
import {partial, compL} from '@cfxjs/compose'
import {validateBase32Address, decode} from '@cfxjs/base32-address'

export const NAME = 'wallet_addVault'

const baseInputSchema = [map, {closed: true}, ['password', password]]
const menomicSchema = [...baseInputSchema, ['mnemonic', mnemonic]]
const privateKeySchema = [...baseInputSchema, ['privateKey', privateKey]]
const addressSchema = [
  ...baseInputSchema,
  [
    'address',
    [
      or,
      ethHexAddress,
      base32AccountMainnetAddress,
      base32AccountTestnetAddress,
    ],
  ],
]

export const schemas = {
  input: [or, menomicSchema, privateKeySchema, addressSchema],
}

export const permissions = {
  methods: ['wallet_validatePassword', 'wallet_getVaults'],
  db: ['createVault'],
}

const processAddress = address => {
  const isBase32 = validateBase32Address(address)
  if (!isBase32) return {address, cfxOnly: false}
  return {cfxOnly: true, address: decode(address).hexAddress}
}

export async function main({
  db: {createVault},
  params: {password, mnemonic, privateKey, address},
  rpcs: {wallet_getVaults, wallet_validatePassword},
  Err,
}) {
  if (!(await wallet_validatePassword({password})))
    throw Err.InvalidParams('Invalid password')

  const vault = {}
  vault.data = mnemonic || privateKey || address
  if (privateKey) vault.type = 'pk'
  else if (mnemonic) vault.type = 'hd'
  else if (address) {
    const validateResult = processAddress(address, Err)
    vault.type = 'pub'
    vault.data = validateResult.address
    vault.cfxOnly = validateResult.cfxOnly
  }

  const vaults = await wallet_getVaults()
  const anyDuplicateVaults = await Promise.all(
    vaults.map(
      compL(
        v => v.data,
        partial(decrypt, password), // decrypt vault, returns stringified { data:..., type:...}
        p => p.then(data => data === vault.data),
      ),
    ),
  )

  if (anyDuplicateVaults.includes(true))
    throw Err.InvalidParams('Duplicate credential')

  vault.data = await encrypt(password, vault.data)

  createVault(vault)
}
