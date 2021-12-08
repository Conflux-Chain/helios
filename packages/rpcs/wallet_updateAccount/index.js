import {map, boolean, dbid, nickname} from '@fluent-wallet/spec'
import {isBoolean} from '@fluent-wallet/checks'
import {isUndefined} from '@fluent-wallet/checks'

export const NAME = 'wallet_updateAccount'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['accountId', dbid],
    ['nickname', {optional: true}, nickname],
    ['offline', {optional: true}, boolean],
    ['hidden', {optional: true}, boolean],
  ],
}

export const permissions = {
  db: ['t', 'getAccountGroup', 'findAccount'],
  external: ['popup'],
}

export const main = async ({
  Err: {InvalidParams},
  db: {t, findAccount},
  params: {nickname, hidden, accountId, offline},
}) => {
  const account = findAccount({
    accountId,
    g: {_accountGroup: {eid: 1}},
  })
  if (!account) throw InvalidParams(`Invalid account id ${accountId}`)
  if (
    nickname &&
    findAccount({groupId: account.accountGroup.eid, nickname})?.length
  )
    throw InvalidParams(
      `Invalid nickname ${nickname}, duplicate with other account in the same account group`,
    )

  t([
    nickname && {eid: accountId, account: {nickname}},
    isBoolean(hidden) && {eid: accountId, account: {hidden}},
    !isUndefined(offline) && {eid: accountId, account: {offline}},
  ])
}
