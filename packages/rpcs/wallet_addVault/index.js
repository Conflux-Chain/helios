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
import {validateBase32Address, decode} from '@cfxjs/base32-address'
import {discoverAccounts} from '@cfxjs/discover-accounts'
import {fromPrivate} from '@cfxjs/account'
import {encode} from '@cfxjs/base32-address'

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
  methods: [
    'wallet_getBalance',
    'wallet_getNextNonce',
    'wallet_validatePassword',
    'wallet_getVaults',
  ],
  db: [
    'getById',
    'updateById',
    'createVault',
    'createAccountGroup',
    'getAccountGroup',
    'getNetwork',
    'createAccount',
    'createAddress',
  ],
}

export function newAccounts(arg) {
  const {
    groupId,
    rpcs: {wallet_getNextNonce, wallet_getBalance},
    vault,
    db: {createAccount, createAddress, getNetwork, updateById, getById},
  } = arg
  const accounts = []

  if (vault.type === 'hd') {
    const networks = getNetwork()

    networks.forEach(({name, hdpath, eid, netId, type}) => {
      let count = 0

      discoverAccounts({
        getBalance: partial(wallet_getBalance, {networkName: name}),
        getTxCount: partial(wallet_getNextNonce, {networkName: name}),
        mnemonic: vault.ddata,
        hdpath: hdpath.value,
        max: 10,
        onFindOne: ({address, privateKey, index}) => {
          const addr = {
            vault: vault.eid,
            hdpath: hdpath.eid,
            network: eid,
            index,
            hex: address,
            cfxHex: address.replace(/0x./, '0x1'),
            pk: privateKey,
          }
          if (type === 'cfx')
            addr.base32Mainnet = encode(
              address.replace(/0x./, '0x1'),
              netId,
              true,
            )
          const addressId = createAddress(addr)

          if (accounts[count]) {
            updateById(accounts[count].eid, {
              addresses: [
                ...accounts[count].addresses.map(a => a.eid),
                addressId,
              ],
            })
          } else {
            const accountId = createAccount({
              accountGroup: groupId,
              nickname: `Account ${count + 1}`,
              addresses: [addressId],
              index: count,
            })
            accounts.push(getById(accountId))
          }

          count++
        },
      })
    })

    return
  } else if (vault.type === 'pk') {
    const addressId = createAddress({
      vault: vault.eid,
      hex: fromPrivate(vault.ddata).address,
      pk: vault.ddata,
    })

    createAccount({
      accountGroup: groupId,
      nickname: `Account 1`,
      addresses: [addressId],
      index: 0,
    })
  } else {
    const addressId = createAddress({
      vault: vault.eid,
      hex: vault.ddata,
    })

    createAccount({
      accountGroup: groupId,
      nickname: `Account 1`,
      addresses: [addressId],
      index: 0,
    })
  }
}

export function newAccountGroup(arg) {
  const {
    db: {getAccountGroup, getNetwork, createAccountGroup, getById},
    vaultId,
  } = arg
  const groups = getAccountGroup()
  const vault = getById(vaultId)
  const networks = getNetwork().reduce((acc, n) => {
    if (vault.cfxOnly && n.type === 'cfx') return acc
    acc.push(n)
    return acc
  }, [])
  const groupName = `Vault ${groups.length + 1}`

  const groupId = createAccountGroup({
    nickname: groupName,
    supportedNetworks: networks.map(n => n.eid),
    vault: vaultId,
  })

  newAccounts({...arg, vault, groupId})

  return groupId
}

const processAddress = address => {
  const isBase32 = validateBase32Address(address)
  if (!isBase32) return {address, cfxOnly: false}
  return {cfxOnly: true, address: decode(address).hexAddress}
}

export async function main(arg) {
  const {
    db: {createVault},
    rpcs: {wallet_getVaults, wallet_validatePassword},
    params: {password, mnemonic, privateKey, address},
    Err,
  } = arg
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

  vault.ddata = vault.data
  vault.data = await encrypt(password, vault.data)

  const vaultId = createVault(vault)
  return newAccountGroup({...arg, vaultId})
}
