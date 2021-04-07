import {
  or,
  map,
  mnemonic,
  privateKey,
  base32AccountMainnetAddress,
  base32AccountTestnetAddress,
  hexAccountAddress,
  password,
} from '@cfxjs/spec'
import {encrypt, decrypt} from 'browser-passworder'
import {partial, compL} from '@cfxjs/compose'

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
      hexAccountAddress,
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

export async function main(
  {
    db: {createVault},
    params: {password, mnemonic, privateKey, address},
    rpcs: {wallet_getVaults, wallet_validatePassword},
    Err,
  } = {params: {}},
) {
  if (!(await wallet_validatePassword({password})))
    throw new Err('Invalid password')
  const keyring = mnemonic || privateKey || address
  let keyringType
  if (address) keyringType = 'pub'
  if (privateKey) keyringType = 'pk'
  if (mnemonic) keyringType = 'hd'
  const encrypted = await encrypt(password, keyring)
  const vaults = await wallet_getVaults()
  const anyDuplicateVaults = await Promise.all(
    vaults.map(
      compL(
        v => v.data,
        partial(decrypt, password), // decrypt vault, returns stringified { data:..., type:...}
        p => p.then(data => data === keyring),
      ),
    ),
  )
  if (anyDuplicateVaults.includes(true)) throw new Err('Duplicate credential')

  createVault({data: encrypted, type: keyringType})
}
