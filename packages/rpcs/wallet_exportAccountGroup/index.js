import {map, dbid, password} from '@fluent-wallet/spec'
import {decrypt} from 'browser-passworder'
import {encode} from '@fluent-wallet/base32-address'
import {CFX_MAINNET_NETID} from '@fluent-wallet/consts'

export const NAME = 'wallet_exportAccountGroup'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['accountGroupId', dbid],
    ['password', password],
  ],
}

export const permissions = {
  db: ['getAccountGroupById'],
  methods: ['wallet_validatePassword'],
  external: ['popup'],
}

export const main = async ({
  Err: {InvalidParams},
  db: {getAccountGroupById},
  rpcs: {wallet_validatePassword},
  params: {password, accountGroupId},
}) => {
  if (!(await wallet_validatePassword({password})))
    throw InvalidParams('Invalid password')

  const group = getAccountGroupById(accountGroupId)
  if (!group?.vault?.data)
    throw InvalidParams(`Invalid account group id ${accountGroupId}`)

  let decrypted =
    group.vault.ddata || (await decrypt(password, group.vault.data))

  if (group.vault.type === 'pub' && group.vault.cfxOnly)
    decrypted = encode(decrypted, CFX_MAINNET_NETID)

  return decrypted
}
