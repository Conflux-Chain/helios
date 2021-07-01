import {map, dbid, password} from '@cfxjs/spec'

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
  Err,
  rpcs: {wallet_validatePassword},
  db: {getAccountGroupById, deleteVaultById, deleteAccountGroupById},
  params: {accountGroupId, password},
}) => {
  if (!(await wallet_validatePassword({password})))
    throw Err.InvalidParams('Incorrect password')

  const group = getAccountGroupById(accountGroupId)

  if (!group)
    throw Err.InvalidParams(`Invalid account group id ${accountGroupId}`)

  deleteVaultById(group.vault.eid)
  return deleteAccountGroupById(group.eid)
}
