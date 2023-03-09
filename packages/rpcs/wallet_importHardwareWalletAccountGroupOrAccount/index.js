import {
  enums,
  map,
  dbid,
  stringp,
  mapp,
  base32UserAddress,
  ethHexAddress,
  or,
  oneOrMore,
  password,
} from '@fluent-wallet/spec'
import {decode, encode} from '@fluent-wallet/base32-address'
import {encrypt} from 'browser-passworder'

export const NAME = 'wallet_importHardwareWalletAccountGroupOrAccount'

const AddressSchema = [
  map,
  {closed: true},
  ['address', [or, base32UserAddress, ethHexAddress]],
  ['nickname', stringp],
]

const BasicSchema = [
  map,
  {closed: true},
  ['password', {optional: true}, password],
  ['accountGroupData', mapp],
  ['address', [oneOrMore, AddressSchema]],
]

// adding new account group
const NewAccountGroupSchema = [
  ['type', [enums, 'cfx', 'eth']],
  ['device', stringp],
  ['accountGroupNickname', stringp],
]

// adding account to existing account group
const OldAccountGroupSchema = [['accountGroupId', dbid]]

export const schemas = {
  input: [
    or,
    BasicSchema.concat(NewAccountGroupSchema),
    BasicSchema.concat(OldAccountGroupSchema),
  ],
}

export const permissions = {
  external: ['popup'],
  methods: ['wallet_addVault'],
  db: [
    'getPassword',
    'findGroup',
    't',
    'findAddress',
    'newAddressTx',
    'findNetwork',
    'findAccount',
  ],
}

export const main = async ({
  Err: {InvalidParams},
  rpcs: {wallet_addVault},
  db: {
    getPassword,
    findGroup,
    t,
    findNetwork,
    newAddressTx,
    findAccount,
    findAddress,
  },
  params: {
    password,
    device,
    type,
    address,
    accountGroupData,
    accountGroupId,
    accountGroupNickname,
  },
}) => {
  if (accountGroupNickname) {
    // crate new account group
    const toImport = {
      accountGroupData,
      nickname: accountGroupNickname,
      password,
      device,
      accounts: address,
    }

    if (type === 'cfx') toImport.cfxOnly = true

    return await wallet_addVault(toImport)
  }

  // add to existing account
  const group = findGroup({
    groupId: accountGroupId,
    g: {vault: {cfxOnly: 1, eid: 1}, account: 1},
  })

  if (!group) throw InvalidParams(`Invalid account group id: ${accountGroupId}`)

  const ddata = JSON.stringify(accountGroupData)
  const data = await encrypt(getPassword(), ddata)

  let txs = [{eid: group.vault.eid, vault: {data, ddata}}]

  const networks = findNetwork({
    type: group.vault.cfxOnly ? 'cfx' : 'eth',
    g: 0,
  })

  // check duplicate address
  networks.forEach(({eid}) =>
    address.forEach(({address}) => {
      try {
        const dupaddr = findAddress({value: address, networkId: eid})
        if (dupaddr) throw InvalidParams(`Address ${address} already exist`)
      } catch (err) {
        if (err.message.includes('already exist')) throw err
      }
    }),
  )

  txs = txs.concat(
    networks.reduce(
      (acc, {eid, netId, type}, idx) =>
        address.reduce((acc, {address, nickname}, jdx) => {
          // hw-vaults.cfxOnly are set explicitly the first time creating the group
          // so hw group can only have 1. cfx network addrs or 2. eth network addrs
          if (group.vault.cfxOnly && type !== 'cfx') return acc
          if (!group.vault.cfxOnly && type === 'cfx') return acc

          const accountIndex = jdx + group.account.length
          const [account] = findAccount({
            groupId: accountGroupId,
            index: accountIndex,
          })
          const accountId = account ?? `newaccount ${jdx}`
          const value = group.vault.cfxOnly
            ? encode(decode(address).hexAddress, netId)
            : address
          const hex = group.vault.cfxOnly ? decode(address).hexAddress : address
          const addrTx = newAddressTx({
            eid: `newaddr ${idx} ${jdx}`,
            value,
            hex,
            network: eid,
          })
          return acc.concat([
            addrTx,
            {
              eid: accountId,
              account: {
                index: accountIndex,
                nickname,
                address: addrTx.eid,
                hidden: false,
              },
            },
            {
              eid: accountGroupId,
              accountGroup: {account: accountId},
            },
          ])
        }, acc),
      [],
    ),
  )

  t(txs)
  return accountGroupId
}
