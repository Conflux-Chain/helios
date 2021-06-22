import {map, stringp, boolean, dbid} from '@cfxjs/spec'
import {isBoolean} from '@cfxjs/checks'

export const NAME = 'wallet_updateAccountGroup'

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
          doc: 'Nickname of this accountGroup, a string with 1 to 64 characters',
        },
      ],
    ],
    ['hidden', {optional: true}, boolean],
  ],
}

export const permissions = {
  db: ['t', 'getAccountGroup', 'getAccountGroupByNickname'],
  external: ['popup'],
}

export const main = async ({
  Err: {InvalidParams},
  db: {getAccountGroup, t, getAccountGroupByNickname},
  params: {nickname, hidden, accountGroupId},
}) => {
  const [group] = getAccountGroup({eid: accountGroupId})
  if (!group) throw InvalidParams(`Invalid accountGroupId ${accountGroupId}`)
  if (nickname && getAccountGroupByNickname(nickname).length)
    throw InvalidParams(
      `Invalid nickname ${nickname}, duplicate with other account group`,
    )

  t([
    nickname && {eid: accountGroupId, accountGroup: {nickname}},
    isBoolean(hidden) && {eid: accountGroupId, accountGroup: {hidden}},
  ])
}
