import {map, dbid, stringp} from '@cfxjs/spec'
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
    [
      'nickname',
      {optional: true},
      [
        stringp,
        {
          min: 1,
          max: 64,
          doc: 'Nickname of this account, a string with 1 to 64 characters',
        },
      ],
    ],
  ],
}

export const permissions = {
  unlocked: true,
  db: [
    'getNetwork',
    'getPassword',
    'getById',
    'getOneAccount',
    't',
    'getAccount',
  ],
}

export const main = async ({
  db: {getById, getPassword, getNetwork, getOneAccount, t, getAccount},
  params: {accountGroupId, nickname},
  Err,
}) => {
  const group = getById(accountGroupId)
  if (!group) throw Err.InvalidParams('Invalid account group id')
  const {vault} = group
  if (vault.type !== 'hd')
    throw Err.InvalidParams("Can't add account into none hd vault")

  const existAccounts = getAccount({accountGroup: accountGroupId})
  const nextAccountIdx = existAccounts.length
  const hasDuplicateNicknameInSameAccountGroup = existAccounts.reduce(
    (acc, account) => acc || account.nickname === nickname,
    false,
  )
  if (hasDuplicateNicknameInSameAccountGroup)
    throw Err.InvalidParams(
      `Invalid nickname "${nickname}", duplicate with other account in the same account group`,
    )

  const password = getPassword()
  const decrypted = vault.ddata ?? (await decrypt(password, vault.data))
  const networks = getNetwork()

  return (
    await Promise.all(
      networks.map(async ({eid, hdPath, netId, type}) => {
        const {address, index, privateKey} = await getNthAccountOfHDKey({
          mnemonic: decrypted,
          hdPath: hdPath.value,
          nth: nextAccountIdx,
          only0x1Prefixed: vault.cfxOnly,
        })

        let accountId =
          getOneAccount({index: nextAccountIdx, accountGroup: accountGroupId})
            ?.eid || 'accountId'

        const {tempids} = t([
          {
            eid: -1,
            address: {
              vault: vault.eid,
              network: eid,
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
          {
            eid: accountId,
            account: {
              index: nextAccountIdx,
              nickname: nickname ?? `Account ${nextAccountIdx + 1}`,
              address: -1,
              accountGroup: accountGroupId,
              hidden: false,
            },
          },
        ])

        accountId = tempids.accountId ?? accountId
        return accountId
      }),
    )
  )[0]
}
