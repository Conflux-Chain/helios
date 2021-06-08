import {
  or,
  map,
  mnemonic,
  privateKey,
  base32UserAddress,
  ethHexAddress,
  password,
} from '@cfxjs/spec'
import {encrypt, decrypt} from 'browser-passworder'
import {partial, compL} from '@cfxjs/compose'
import {validateBase32Address, decode, encode} from '@cfxjs/base32-address'
import {fromPrivate} from '@cfxjs/account'
import {stripHexPrefix} from '@cfxjs/utils'

export const NAME = 'wallet_addVault'

const baseInputSchema = [map, {closed: true}, ['password', password]]
const menomicSchema = [...baseInputSchema, ['mnemonic', mnemonic]]
const privateKeySchema = [...baseInputSchema, ['privateKey', privateKey]]
const addressSchema = [
  ...baseInputSchema,
  ['address', [or, ethHexAddress, base32UserAddress]],
]

export const schemas = {
  input: [or, menomicSchema, privateKeySchema, addressSchema],
}

export const permissions = {
  internal: true,
  methods: [
    'wallet_discoverAccounts',
    'wallet_getBalance',
    'wallet_getNextNonce',
    'wallet_validatePassword',
  ],
  db: [
    't',
    'getById',
    'getVault',
    'createVault',
    'getAccountGroup',
    'getNetwork',
    'getOneAccount',
  ],
}

export async function newAccounts(arg) {
  const {
    groupId,
    rpcs: {wallet_discoverAccounts},
    vault,
    db: {getNetwork, t, getOneAccount},
  } = arg

  if (vault.type === 'hd') {
    await wallet_discoverAccounts({accountGroupId: groupId, limit: 10})
    return
  }

  const networks = getNetwork()

  networks.forEach(({eid, netId, type}) => {
    const account = getOneAccount({index: 0, accountGroup: groupId})
    if (vault.type === 'pk') {
      t([
        {
          eid: -1,
          address: {
            hex: fromPrivate(vault.ddata).address,
            pk: vault.ddata,
            vault: vault.eid,
            network: eid,
          },
        },
        {
          eid: account?.eid ?? -2,
          account: {
            accountGroup: groupId,
            address: -1,
            index: 0,
            nickname: 'Account 1',
            hidden: false,
          },
        },
      ])

      return
    }

    if (vault.cfxOnly && type !== 'cfx') return

    t([
      {eid: -1, address: {hex: vault.ddata, vault: vault.eid, network: eid}},
      vault.cfxOnly && {eid: -1, address: {cfxHex: vault.ddata}},
      type === 'cfx' && {
        eid: -1,
        address: {base32Mainnet: encode(vault.ddata, netId, true)},
      },
      {
        eid: account?.eid ?? -2,
        account: {
          index: 0,
          nickname: 'Account 1',
          address: -1,
          accountGroup: groupId,
          hidden: false,
        },
      },
    ])
  })
}

export function newAccountGroup(arg) {
  const {
    db: {getAccountGroup, getNetwork, getById, t},
    vaultId,
  } = arg
  const groups = getAccountGroup()
  const vault = getById(vaultId)
  const groupName = `Vault ${groups.length + 1}`

  const networks = getNetwork().reduce((acc, n) => {
    if (vault.cfxOnly && n.type === 'cfx') return acc
    acc.push(n)
    return acc
  }, [])

  const {tempids} = t([
    {
      eid: -1,
      accountGroup: {nickname: groupName, vault: vaultId, hidden: false},
    },
    ...networks.map(({eid}) => ({eid: -1, accountGroup: {network: eid}})),
  ])
  const groupId = tempids['-1']

  newAccounts({...arg, vault, groupId})

  return groupId
}

const processAddress = address => {
  const isBase32 = validateBase32Address(address)
  if (!isBase32) return {address, cfxOnly: false}
  return {
    cfxOnly: true,
    address: `0x${decode(address).hexAddress.toString('hex')}`,
  }
}

export async function main(arg) {
  const {
    db: {createVault, getVault},
    rpcs: {wallet_validatePassword},
    params: {password, mnemonic, privateKey, address},
    Err,
  } = arg
  if (!(await wallet_validatePassword({password})))
    throw Err.InvalidParams('Invalid password')

  const vault = {}
  vault.data = mnemonic || privateKey || address
  if (privateKey) {
    vault.type = 'pk'
    vault.data = stripHexPrefix(privateKey)
  } else if (mnemonic) vault.type = 'hd'
  else if (address) {
    const validateResult = processAddress(address, Err)
    vault.type = 'pub'
    vault.data = validateResult.address
    vault.cfxOnly = validateResult.cfxOnly
  }

  const vaults = getVault()
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

  vault.ddata = vault.data
  vault.data = await encrypt(password, vault.data)

  const vaultId = createVault(vault)
  return newAccountGroup({...arg, vaultId})
}
