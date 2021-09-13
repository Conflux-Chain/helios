import {dbid, map, password} from '@fluent-wallet/spec'
import {decrypt} from 'browser-passworder'

export const NAME = 'wallet_getAccountGroupVaultValue'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['accountGroupId', dbid],
    [
      'password',
      {optional: true, doc: 'required when calling from popup'},
      password,
    ],
  ],
}

export const permissions = {
  external: ['popup', 'inpage'],
  db: ['getPassword', 'getAccountGroupById'],
}

export const main = async ({
  Err: {InvalidParams},
  db: {getPassword, getAccountGroupById},
  params: {password, accountGroupId},
  _popup,
}) => {
  if (_popup && password !== getPassword())
    throw InvalidParams('Invalid password')
  const group = getAccountGroupById(accountGroupId)
  if (!group) throw InvalidParams(`Invalid account group id ${accountGroupId}`)

  password = getPassword()
  return group.vault.ddata || (await decrypt(password, group.vault.data))
}
