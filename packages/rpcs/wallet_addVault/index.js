import {updateUserId, captureMessage} from '@fluent-wallet/sentry'
import {
  stringp,
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
  oneOrMore,
  mapp,
} from '@fluent-wallet/spec'
import {encrypt, decrypt} from 'browser-passworder'
import {compL} from '@fluent-wallet/compose'
import {
  validateBase32Address,
  decode,
  encode,
} from '@fluent-wallet/base32-address'
import {fromPrivate, toAccountAddress} from '@fluent-wallet/account'
import {stripHexPrefix} from '@fluent-wallet/utils'
import {chan} from '@fluent-wallet/csp'

export const NAME = 'wallet_addVault'

const baseInputSchema = [
  map,
  {closed: true},
  ['device', {optional: true}, stringp],
  ['password', {optional: true}, password],
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
const hwSchema = [
  ...baseInputSchema,
  ['accountGroupData', mapp],
  ['cfxOnly', {optional: true}, truep],
  [
    'accounts',
    [
      oneOrMore,
      [
        map,
        {closed: true},
        ['address', [or, base32UserAddress, ethHexAddress]],
        ['nickname', stringp],
      ],
    ],
  ],
]

export const schemas = {
  input: [or, menomicSchema, privateKeySchema, addressSchema, hwSchema],
}

export const permissions = {
  methods: [
    'wallet_unlock',
    'wallet_discoverAccounts',
    'wallet_getBalance',
    'wallet_getNextNonce',
    'wallet_validatePassword',
    'wallet_deleteAccountGroup',
    'wallet_setCurrentAccount',
  ],
  db: [
    'getAddress',
    'findAccount',
    'newAddressTx',
    'getGroupFirstAccountId',
    'getAccountGroupByVaultType',
    't',
    'getOneAccount',
    'getAccount',
    'getVault',
    'getVaultById',
    'createVault',
    'findGroup',
    'getNetwork',
    'getLocked',
    'getPassword',
  ],
}

async function selectNewlyCreatedAccountGroupFirstAccount({
  rpcs: {wallet_setCurrentAccount},
  db: {getGroupFirstAccountId},
  groupId,
}) {
  return await wallet_setCurrentAccount([getGroupFirstAccountId({groupId})])
}

const DefaultGroupNamePrefix = {
  hd: 'Seed-',
  pub: 'Follow-',
  pk: 'Account-',
  hw: 'Hardware Wallet-',
}

export async function newAccounts(arg) {
  const {
    allAccountCreatedChan,
    firstAccountCreatedChan,
    groupId,
    groupName,
    rpcs: {wallet_discoverAccounts},
    params: {waitTillFinish, accounts},
    vault,
    db: {getNetwork, t, newAddressTx, findAccount},
  } = arg

  if (vault.type === 'hd') {
    await wallet_discoverAccounts({
      accountGroupId: groupId,
      waitTillFinish,
    })
    if (waitTillFinish) allAccountCreatedChan.write(true)
    firstAccountCreatedChan.write(true)
    return
  }

  const networks = getNetwork()

  // for each network
  // create ONE account and address for pk/pub group
  // or create specified accounts and addrs for hw group
  networks.forEach(({eid, netId, type}) => {
    if (vault.type === 'pk') {
      const [account] = findAccount({groupId, index: 0})
      const addr = fromPrivate(vault.ddata).address
      const addrTx = newAddressTx({
        eid: -1,
        value: type === 'cfx' ? encode(toAccountAddress(addr), netId) : addr,
        hex: addr,
        pk: vault.ddata,
        network: eid,
      })
      t([
        addrTx,
        {
          eid: account ?? -2,
          account: {
            address: addrTx.eid,
            index: 0,
            nickname: groupName,
            hidden: false,
          },
        },
        {eid: groupId, accountGroup: {account: account ?? -2}},
      ])
      firstAccountCreatedChan.write(true)

      return
    }

    if (vault.cfxOnly && type !== 'cfx') return

    if (vault.type === 'pub') {
      // vault.type is 'pub'

      const addrTx = newAddressTx({
        eid: -1,
        hex: vault.ddata,
        network: eid,
        value:
          type === 'cfx'
            ? encode(toAccountAddress(vault.ddata), netId)
            : vault.ddata,
      })
      t([
        addrTx,
        {
          eid: -2,
          account: {
            index: 0,
            nickname: groupName,
            address: addrTx.eid,
            hidden: false,
          },
        },
        {
          eid: groupId,
          accountGroup: {account: -2},
        },
      ])
      firstAccountCreatedChan.write(true)
      return
    }

    if (vault.type === 'hw') {
      if (!vault.cfxOnly && type === 'cfx') return
      accounts.forEach(({address, nickname}, idx) => {
        const [account] = findAccount({groupId, index: idx})
        const hex = type === 'cfx' ? decode(address).hexAddress : address
        const value =
          type === 'cfx' ? encode(decode(address).hexAddress, netId) : address

        const addrTx = newAddressTx({
          eid: -1,
          value,
          hex,
          network: eid,
        })

        t([
          addrTx,
          {
            eid: account ?? -2,
            account: {
              index: idx,
              nickname,
              address: addrTx.eid,
              hidden: false,
            },
          },
          {
            eid: groupId,
            accountGroup: {account: account ?? -2},
          },
        ])
        idx === 0 && firstAccountCreatedChan.write(true)
      })
      return
    }
  })
}

export async function newAccountGroup(arg) {
  const {
    selectedAccountSetChan,
    params: {nickname},
    db: {getAccountGroupByVaultType, getVaultById, t},
    vaultId,
  } = arg
  const vault = getVaultById(vaultId)
  const groupIds = getAccountGroupByVaultType(vault.type)
  const groupName =
    nickname || `${DefaultGroupNamePrefix[vault.type]}${groupIds.length + 1}`

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
    selectNewlyCreatedAccountGroupFirstAccount({...arg, groupId}).then(
      selectedAccountSetChan.write(true),
    )
  })

  await newAccountsPromise

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
    db: {
      getAddress,
      createVault,
      getVault,
      findGroup,
      getVaultById,
      getPassword,
      getLocked,
    },
    rpcs: {wallet_validatePassword, wallet_deleteAccountGroup, wallet_unlock},
    params: {
      device = 'FluentWebExt',
      password: optionalPassword,
      accountGroupData,
      mnemonic,
      privateKey,
      address,
      cfxOnly,
      force,
    },
    Err: {InvalidParams},
  } = arg
  const isFirstGroup = !findGroup()?.length
  const isLocked = getLocked()
  let password = optionalPassword

  // need password on first import
  if (isLocked && isFirstGroup && !password)
    throw InvalidParams('Invalid password')

  // need wallet to be unlocked on rest import
  if (!isFirstGroup && !password) password = getPassword()

  if (!(await wallet_validatePassword({password})))
    throw InvalidParams('Invalid password')

  // create vault to be added
  const vault = {cfxOnly: false, device}
  vault.data = mnemonic || privateKey || address || accountGroupData
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
  } else if (accountGroupData) {
    vault.type = 'hw'
    vault.data = JSON.stringify(accountGroupData)
    vault.cfxOnly = cfxOnly
  }

  const vaults = getVault({type: vault.type}) || []

  // check duplicate vaults
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
    const [duplicateAccountGroupId] = findGroup({vault: duplicateVaultId})
    const duplicateVault = getVaultById(duplicateVaultId)

    if (force) {
      if (duplicateVault.type !== 'hd')
        throw InvalidParams("Can't force import none hd vault")
      await wallet_deleteAccountGroup({
        accountGroupId: duplicateAccountGroupId,
        password,
      })
    } else {
      let err
      if (vault.type === 'hd' && duplicateVault.cfxOnly !== vault.cfxOnly) {
        err = InvalidParams(
          `Duplicate credential(with different cfxOnly setting) with account group ${duplicateAccountGroupId}`,
        )
        err.extra.updateCfxOnly = true
      } else {
        err = InvalidParams(
          `Duplicate credential with account group ${duplicateAccountGroupId}`,
        )
      }
      err.extra.duplicateAccountGroupId = duplicateAccountGroupId
      throw err
    }
  }

  vault.ddata = vault.data
  vault.data = await encrypt(password, vault.data)

  const vaultId = createVault(vault)
  // 如果是第一次创建账户的话需要调用 wallet_unlock
  if (isFirstGroup) await wallet_unlock({password, waitSideEffects: true})
  const selectedAccountSetChan = chan(1)
  const firstAccountCreatedChan = chan(1)
  const allAccountCreatedChan = chan(1)
  const groupId = newAccountGroup({
    ...arg,
    vaultId,
    allAccountCreatedChan,
    selectedAccountSetChan,
    firstAccountCreatedChan,
  })

  const promises = [
    selectedAccountSetChan.read(),
    firstAccountCreatedChan.read(),
  ]
  if (arg.params.waitTillFinish) promises.push(allAccountCreatedChan.read())

  return await Promise.all(promises).then(() => {
    updateUserId(getAddress()?.[0]?.hex)
    if (isFirstGroup) captureMessage('user_created_first_account_group')
    return groupId
  })
}
