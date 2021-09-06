import {
  or,
  map,
  mnemonic,
  privateKey,
  base32UserAddress,
  ethHexAddress,
  password,
  truep,
  maybe,
  nickname,
} from '@cfxjs/spec'
import {encrypt, decrypt} from 'browser-passworder'
import {compL} from '@cfxjs/compose'
import {validateBase32Address, decode, encode} from '@cfxjs/base32-address'
import {fromPrivate, toAccountAddress} from '@cfxjs/account'
import {stripHexPrefix} from '@cfxjs/utils'

export const NAME = 'wallet_addVault'

const baseInputSchema = [
  map,
  {closed: true},
  ['password', password],
  ['nickname', {optional: true}, nickname],
]
const menomicSchema = [
  ...baseInputSchema,
  ['mnemonic', mnemonic],
  ['waitTillFinish', {optional: true}, [maybe, truep]],
  [
    'cfxOnly',
    {
      optional: true,
      doc: 'only derive conflux compatible address from this mnemonic',
    },
    truep,
  ],
  [
    'force',
    {optional: true, doc: 'set to true to skip duplication check'},
    truep,
  ],
]

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
    'wallet_discoverAccounts',
    'wallet_getBalance',
    'wallet_getNextNonce',
    'wallet_validatePassword',
    'wallet_deleteAccountGroup',
  ],
  db: [
    't',
    'getOneAccount',
    'getAccount',
    'getVault',
    'getVaultById',
    'createVault',
    'getAccountGroup',
    'getNetwork',
    'getOneAccountByGroupAndIndex',
  ],
}

function setDefaultSelectedAccount({db: {getOneAccount, getAccount, t}}) {
  if (!getOneAccount({selected: true})) {
    const defaultSelectedAccount = getAccount()[0]
    if (defaultSelectedAccount)
      t([{eid: defaultSelectedAccount.eid, account: {selected: true}}])
  }
}

export async function newAccounts(arg) {
  const {
    groupId,
    groupName,
    params: {waitTillFinish},
    rpcs: {wallet_discoverAccounts},
    vault,
    db: {getNetwork, t, getOneAccountByGroupAndIndex},
  } = arg

  if (vault.type === 'hd') {
    await wallet_discoverAccounts({
      accountGroupId: groupId,
      limit: 10,
      waitTillFinish,
    })
    return
  }

  const networks = getNetwork()

  networks.forEach(({eid, netId, type}) => {
    const account = getOneAccountByGroupAndIndex({index: 0, groupId})
    if (vault.type === 'pk') {
      const addr = fromPrivate(vault.ddata).address
      t([
        {
          eid: -1,
          address: {
            hex: addr,
            pk: vault.ddata,
            vault: vault.eid,
          },
        },
        type === 'cfx' && {
          eid: -1,
          address: {
            cfxHex: toAccountAddress(addr),
            base32: encode(toAccountAddress(addr), netId, true),
          },
        },
        {eid, network: {address: -1}},
        {
          eid: account?.eid ?? -2,
          account: {
            address: -1,
            index: 0,
            nickname: `${groupName}-1`,
            hidden: false,
          },
        },
        {eid: groupId, accountGroup: {account: account?.eid ?? -2}},
      ])

      return
    }

    if (vault.cfxOnly && type !== 'cfx') return

    t([
      {eid: -1, address: {hex: vault.ddata, vault: vault.eid}},
      type === 'cfx' && {
        eid: -1,
        address: {
          base32: encode(toAccountAddress(vault.ddata), netId, true),
          cfxHex: toAccountAddress(vault.ddata),
        },
      },
      {eid, network: {address: -1}},
      {
        eid: account?.eid ?? -2,
        account: {
          index: 0,
          nickname: `${groupName}-1`,
          address: -1,
          hidden: false,
        },
      },
      {
        eid: groupId,
        accountGroup: {account: account?.eid ?? -2},
      },
    ])
  })
}

export async function newAccountGroup(arg) {
  const {
    params: {waitTillFinish, nickname},
    db: {getAccountGroup, getVaultById, t},
    vaultId,
  } = arg
  const groups = getAccountGroup()
  const vault = getVaultById(vaultId)
  const groupName = nickname || `Seed-${groups.length + 1}`

  const {tempids} = t([
    {
      eid: -1,
      accountGroup: {nickname: groupName, vault: vaultId, hidden: false},
    },
  ])
  const groupId = tempids['-1']

  const newAccountsPromise = newAccounts({
    ...arg,
    vault,
    groupId,
    groupName,
  }).then(() => {
    setDefaultSelectedAccount(arg)
  })

  if (waitTillFinish) await newAccountsPromise

  return groupId
}

const processAddress = address => {
  const isBase32 = validateBase32Address(address)
  if (!isBase32) return {address, cfxOnly: false}
  return {
    cfxOnly: true,
    address: decode(address).hexAddress.toString('hex'),
  }
}

export const main = async arg => {
  const {
    db: {createVault, getVault, getAccountGroup, getVaultById},
    rpcs: {wallet_validatePassword, wallet_deleteAccountGroup},
    params: {password, mnemonic, privateKey, address, cfxOnly, force},
    Err: {InvalidParams},
  } = arg
  if (!(await wallet_validatePassword({password})))
    throw InvalidParams('Invalid password')

  const vault = {cfxOnly: false}
  vault.data = mnemonic || privateKey || address
  if (privateKey) {
    vault.type = 'pk'
    vault.data = stripHexPrefix(privateKey)
  } else if (mnemonic) {
    vault.type = 'hd'
    if (cfxOnly) vault.cfxOnly = true
  } else if (address) {
    const validateResult = processAddress(address)
    vault.type = 'pub'
    vault.data = validateResult.address
    vault.cfxOnly = validateResult.cfxOnly
  }

  const vaults = getVault()
  const anyDuplicateVaults = (
    await Promise.all(
      vaults.map(
        compL(
          async v => [v.ddata || (await decrypt(password, v.data)), v.eid],
          p => p.then(([ddata, eid]) => (ddata === vault.data ? eid : null)),
        ),
      ),
    )
  ).filter(v => Boolean(v))

  if (anyDuplicateVaults.length) {
    const [duplicateVaultId] = anyDuplicateVaults
    const [duplicateAccountGroup] = getAccountGroup({vault: duplicateVaultId})
    const duplicateVault = getVaultById(duplicateVaultId)

    if (force) {
      if (duplicateVault.type !== 'hd')
        throw InvalidParams("Can't force import none hd vault")
      await wallet_deleteAccountGroup({
        accountGroupId: duplicateAccountGroup.eid,
        password,
      })
    } else {
      let err
      if (vault.type === 'hd' && duplicateVault.cfxOnly !== vault.cfxOnly) {
        err = InvalidParams(
          `Duplicate credential(with different cfxOnly setting) with account group ${duplicateAccountGroup.eid}`,
        )
        err.updateCfxOnly = true
      } else {
        err = InvalidParams(
          `Duplicate credential with account group ${duplicateAccountGroup.eid}`,
        )
      }
      err.duplicateAccountGroupId = duplicateAccountGroup.eid
      throw err
    }
  }

  vault.ddata = vault.data
  vault.data = await encrypt(password, vault.data)

  const vaultId = createVault(vault)
  const groupId = newAccountGroup({...arg, vaultId})

  return groupId
}
