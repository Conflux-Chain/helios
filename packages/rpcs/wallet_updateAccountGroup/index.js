import {map, boolean, dbid, nickname} from '@fluent-wallet/spec'
import {isBoolean} from '@fluent-wallet/checks'

export const NAME = 'wallet_updateAccountGroup'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['accountGroupId', dbid],
    ['nickname', {optional: true}, nickname],
    ['hidden', {optional: true}, boolean],
  ],
}

export const permissions = {
  db: ['t', 'findGroup', 'getAccountGroupByNickname'],
  external: ['popup'],
}

export const main = async ({
  Err: {InvalidParams},
  db: {findGroup, t, getAccountGroupByNickname},
  params: {nickname, hidden, accountGroupId},
}) => {
  const group = findGroup({groupId: accountGroupId})
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
