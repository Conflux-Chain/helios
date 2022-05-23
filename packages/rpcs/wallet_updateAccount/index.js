import {map, boolean, dbid, nickname} from '@fluent-wallet/spec'

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
  db: ['findAccount', 'updateAccountWithHiddenHandler', 'isLastNoneHWAccount'],
  methods: ['wallet_deleteApp', 'wallet_setAppCurrentAccount'],
  external: ['popup'],
}

export const main = async ({
  Err: {InvalidParams},
  rpcs,
  db: {findAccount, updateAccountWithHiddenHandler, isLastNoneHWAccount},
  params,
}) => {
  const account = findAccount({
    accountId: params.accountId,
    g: {eid: 1},
  })

  if (!account) throw InvalidParams(`Invalid account id ${params.accountId}`)

  if (params.hidden && !isLastNoneHWAccount(account.eid))
    throw InvalidParams(`Account ${account.eid} is last none HW account`)

  const sideEffects = updateAccountWithHiddenHandler(params)

  await Promise.all(sideEffects.map(([method, params]) => rpcs[method](params)))
}
