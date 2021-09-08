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
  db: ['getAccountGroupById', 'deleteVaultById', 'deleteAccountGroupById'],
  external: ['popup'],
  methods: ['wallet_validatePassword'],
}

export const main = async ({
  Err: {InvalidParams},
  rpcs: {wallet_validatePassword},
  db: {getAccountGroupById, deleteVaultById, deleteAccountGroupById},
  params: {accountGroupId, password},
}) => {
  if (!(await wallet_validatePassword({password})))
    throw InvalidParams('Incorrect password')

  const group = getAccountGroupById(accountGroupId)

  if (!group) throw InvalidParams(`Invalid account group id ${accountGroupId}`)

  deleteVaultById(group.vault.eid)
  return deleteAccountGroupById(group.eid)
}
