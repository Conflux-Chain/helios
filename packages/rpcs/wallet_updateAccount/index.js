import {map, stringp, boolean, dbid} from '@cfxjs/spec'
import {isBoolean} from '@cfxjs/checks'
import {isUndefined} from '@cfxjs/checks'

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
    ['offline', {optional: true}, boolean],
    ['hidden', {optional: true}, boolean],
  ],
}

export const permissions = {
  db: ['t', 'getAccountById', 'getAccountGroup', 'anyDupNickAccount'],
  external: ['popup'],
}

export const main = async ({
  Err: {InvalidParams},
  db: {getAccountById, t, anyDupNickAccount},
  params: {nickname, hidden, accountId, offline},
}) => {
  const account = getAccountById(accountId)
  if (!account) throw InvalidParams(`Invalid account id ${accountId}`)
  if (nickname && anyDupNickAccount({accountId, nickname}))
    throw InvalidParams(
      `Invalid nickname ${nickname}, duplicate with other account in the same account group`,
    )

  t([
    nickname && {eid: accountId, account: {nickname}},
    isBoolean(hidden) && {eid: accountId, account: {hidden}},
    !isUndefined(offline) && {eid: accountId, account: {offline}},
  ])
}
