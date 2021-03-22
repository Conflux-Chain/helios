import {
  or,
  map,
  mnemonic,
  privateKey,
  base32AccountMainnetAddress,
  base32AccountTestnetAddress,
  hexAccountAddress,
  password,
  arr,
  string,
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

export const schema = {
  input: [or, menomicSchema, privateKeySchema, addressSchema],
  setWalletState: [map, ['Vaults', [arr, string]]],
}

export const permissions = {
  methods: ['wallet_validatePassword'],
  store: {read: true, write: true},
}

export async function main(
  {
    getWalletState,
    setWalletState,
    params: {password, mnemonic, privateKey, address},
    rpcs,
    Err,
  } = {params: {}},
) {
  const {wallet_validatePassword} = rpcs
  if (!(await wallet_validatePassword(password))) throw Err('Invalid password')
  const keyring = mnemonic || privateKey || address
  let keyringType
  if (address) keyringType = 'pub'
  if (privateKey) keyringType = 'pk'
  if (mnemonic) keyringType = 'hd'
  const encrypted = await encrypt(
    password,
    JSON.stringify({data: keyring, type: keyringType}),
  )
  const vaults = getWalletState().Vaults || []
  const anyDuplicateVaults = await Promise.all(
    vaults.map(
      compL(
        partial(decrypt, password), // decrypt vault, returns stringified { data:..., type:...}
        p => p.then(data => JSON.parse(data)),
        p => p.then(({data}) => data === keyring),
      ),
    ),
  )
  if (anyDuplicateVaults.includes(true)) throw Err('Duplicate credential')

  setWalletState({
    Vaults: [...vaults, encrypted],
  })
}
