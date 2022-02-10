import {map, dbid, password} from '@fluent-wallet/spec'

export const NAME = 'wallet_deleteAccountGroup'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['accountGroupId', dbid],
    ['password', password],
  ],
}

export const permissions = {
  db: ['getAccountGroupById', 'retractGroup'],
  external: ['popup'],
  methods: ['wallet_validatePassword'],
}

export const main = async ({
  Err: {InvalidParams},
  rpcs: {wallet_validatePassword},
  db: {getAccountGroupById, retractGroup},
  params: {accountGroupId, password},
}) => {
  if (!(await wallet_validatePassword({password})))
    throw InvalidParams('Invalid password')

  const group = getAccountGroupById(accountGroupId)

  if (!group) throw InvalidParams(`Invalid account group id ${accountGroupId}`)

  retractGroup({groupId: group.eid})
  return true
}
