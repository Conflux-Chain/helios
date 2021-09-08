import {dbid, map, password} from '@fluent-wallet/spec'

export const NAME = 'wallet_deleteNetwork'

export const schemas = {
  input: [map, {closed: true}, ['password', password], ['networkId', dbid]],
}

export const permissions = {
  external: ['popup'],
  db: ['deleteNetworkById', 'getNetworkById'],
  methods: ['wallet_validatePassword'],
}

export const main = async ({
  Err: {InvalidParams},
  db: {deleteNetworkById, getNetworkById},
  rpcs: {wallet_validatePassword},
  params: {password, networkId},
}) => {
  if (!(await wallet_validatePassword({password})))
    throw InvalidParams('Incorrect password')

  const network = getNetworkById(networkId)
  if (!network) throw InvalidParams(`Invalid network id ${networkId}`)
  if (network.builtin)
    throw InvalidParams(`Not allowed to delete builtin network`)

  return deleteNetworkById(networkId)
}
