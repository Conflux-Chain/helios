import {map, dbid, nickname} from '@cfxjs/spec'
import {decrypt} from 'browser-passworder'
import {getNthAccountOfHDKey} from '@cfxjs/hdkey'
import {toAccountAddress} from '@cfxjs/account'
import {encode} from '@cfxjs/base32-address'

export const NAME = 'wallet_createAccount'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['accountGroupId', dbid],
    ['nickname', {optional: true}, nickname],
  ],
}

export const permissions = {
  db: [
    'getNetwork',
    'getPassword',
    'getAccountGroupById',
    'getOneAccountByGroupAndIndex',
    't',
  ],
  external: ['popup'],
}

export const main = async ({
  db: {
    getPassword,
    getNetwork,
    getOneAccountByGroupAndIndex,
    t,
    getAccountGroupById,
  },
  params: {accountGroupId, nickname},
  Err: {InvalidParams},
}) => {
  const group = getAccountGroupById(accountGroupId)
  if (!group) throw InvalidParams('Invalid account group id')
  const {vault} = group
  if (vault.type !== 'hd')
    throw InvalidParams("Can't add account into none hd vault")

  const existAccounts = group.account || []
  const nextAccountIdx = existAccounts.length
  const hasDuplicateNicknameInSameAccountGroup = existAccounts.reduce(
    (acc, account) => acc || account.nickname === nickname,
    false,
  )
  if (hasDuplicateNicknameInSameAccountGroup)
    throw InvalidParams(
      `Invalid nickname "${nickname}", duplicate with other account in the same account group`,
    )

  const password = getPassword()
  const decrypted = vault.ddata ?? (await decrypt(password, vault.data))
  const networks = getNetwork()

  return (
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
    ).then(params =>
      params.map(({eid, netId, type, addr: {address, index, privateKey}}) => {
        let accountId =
          getOneAccountByGroupAndIndex({
            index: nextAccountIdx,
            groupId: accountGroupId,
          })?.eid || 'accountId'

        const {tempids} = t([
          {
            eid: -1,
            address: {
              vault: vault.eid,
              index,
              hex: address,
              pk: privateKey,
            },
          },
          type === 'cfx' && {
            eid: -1,
            address: {
              cfxHex: toAccountAddress(address),
              base32: encode(toAccountAddress(address), netId, true),
            },
          },
          {eid, network: {address: -1}},
          {
            eid: accountId,
            account: {
              index: nextAccountIdx,
              nickname: nickname ?? `${group.nickname}-${nextAccountIdx + 1}`,
              address: -1,
              hidden: false,
            },
          },
          {eid: accountGroupId, accountGroup: {account: accountId}},
        ])

        accountId = tempids.accountId ?? accountId
        return accountId
      }),
    )
  )[0]
}
