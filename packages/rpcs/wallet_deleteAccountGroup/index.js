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
  db: ['deleteAccountGroupById'],
  external: ['popup'],
  methods: ['wallet_validatePassword'],
}

export const main = async ({
  Err,
  rpcs: {wallet_validatePassword},
  db: {deleteAccountGroupById},
  params: {accountGroupId, password},
}) => {
  if (!(await wallet_validatePassword({password})))
    throw Err.InvalidParams('Incorrect password')

  const deleted = deleteAccountGroupById(accountGroupId)
  if (!deleted)
    throw Err.InvalidParams(`Invalid account group id ${accountGroupId}`)
  return deleted
}
