import {map, stringp, boolean, dbid} from '@cfxjs/spec'
import {isBoolean} from '@cfxjs/checks'

export const NAME = 'wallet_updateAccount'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['accountId', dbid],
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
    ['hidden', {optional: true}, boolean],
  ],
}

export const permissions = {
  db: ['t', 'getById', 'getAccount'],
}

export const main = async ({
  Err: {InvalidParams},
  db: {getById, t, getAccount},
  params: {nickname, hidden, accountId},
}) => {
  const account = getById(accountId)
  if (!account) throw InvalidParams(`Invalid accountId ${accountId}`)
  if (
    nickname &&
    getAccount({accountGroup: account.accountGroup.eid, nickname}).length
  )
    throw InvalidParams(
      `Invalid nickname ${nickname}, duplicate with other account in the same account group`,
    )

  t([
    nickname && {eid: accountId, account: {nickname}},
    isBoolean(hidden) && {eid: accountId, account: {hidden}},
  ])
}
