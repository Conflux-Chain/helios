import {map, dbid, nickname, boolean} from '@fluent-wallet/spec'
import {decrypt} from 'browser-passworder'
import {getNthAccountOfHDKey} from '@fluent-wallet/hdkey'
import {toAccountAddress} from '@fluent-wallet/account'
import {encode} from '@fluent-wallet/base32-address'

export const NAME = 'wallet_createAccount'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['accountGroupId', dbid],
    ['nickname', {optional: true}, nickname],
    ['select', {optional: true}, boolean],
  ],
}

export const permissions = {
  db: [
    'findGroup',
    'findAccount',
    'getNetwork',
    'getPassword',
    't',
    'newAddressTx',
  ],
  methods: ['wallet_setCurrentAccount'],
  external: ['popup'],
}

export const main = async ({
  rpcs: {wallet_setCurrentAccount},
  db: {findGroup, getPassword, getNetwork, t, findAccount, newAddressTx},
  params: {accountGroupId, nickname, select},
  Err: {InvalidParams},
  _popup,
}) => {
  const group = findGroup({
    groupId: accountGroupId,
    g: {
      account: {nickname: 1},
      vault: {type: 1, ddata: 1, data: 1, cfxOnly: 1},
      nickname: 1,
    },
  })
  if (!group) throw InvalidParams(`Invalid account group id ${accountGroupId}`)

  const {vault} = group
  if (vault.type !== 'hd')
    throw InvalidParams("Can't add account into none hd vault")

  const existAccounts = group.account || []
  const nextAccountIdx = existAccounts.length
  // const hasDuplicateNicknameInSameAccountGroup = existAccounts.reduce(
  //   (acc, account) => acc || account.nickname === nickname,
  //   false,
  // )
  // if (hasDuplicateNicknameInSameAccountGroup)
  //   throw InvalidParams(
  //     `Invalid nickname "${nickname}", duplicate with other account in the same account group`,
  //   )

  const password = getPassword()
  const decrypted = vault.ddata ?? (await decrypt(password, vault.data))
  const networks = getNetwork()

  const accountId = (
    await Promise.all(
      networks.map(async ({eid, hdPath, netId, type}) => ({
        eid,
        netId,
        type,
        addr: await getNthAccountOfHDKey({
          mnemonic: decrypted,
          hdPath: hdPath.value,
          nth: nextAccountIdx,
          only0x1Prefixed: vault.cfxOnly,
        }),
      })),
    ).then(params => {
      const _group = findGroup({
        groupId: accountGroupId,
        g: {
          account: {nickname: 1},
          vault: {type: 1, ddata: 1, data: 1, cfxOnly: 1},
          nickname: 1,
        },
      })
      // check group is deleted or not
      if (!_group)
        throw InvalidParams(`Invalid account group id ${accountGroupId}`)
      return params.map(({eid, netId, type, addr: {address, privateKey}}) => {
        const accountId =
          findAccount({
            groupId: accountGroupId,
            index: nextAccountIdx,
          })[0] || 'accountId'

        const addrTx = newAddressTx({
          eid: -1,
          network: eid,
          value:
            type === 'cfx' ? encode(toAccountAddress(address), netId) : address,
          hex: address,
          pk: privateKey,
        })

        const {tempids} = t([
          addrTx,
          {
            eid: accountId,
            account: {
              index: nextAccountIdx,
              nickname: nickname ?? `${group.nickname}-${nextAccountIdx + 1}`,
              address: addrTx.eid,
              hidden: false,
            },
          },
          {eid: accountGroupId, accountGroup: {account: accountId}},
        ])

        return tempids.accountId ?? accountId
      })
    })
  )[0]

  if (_popup && select) {
    await wallet_setCurrentAccount([accountId])
  }
  return accountId
}
