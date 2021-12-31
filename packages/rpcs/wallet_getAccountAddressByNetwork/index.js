import {or, dbid, map, oneOrMore} from '@fluent-wallet/spec'

export const NAME = 'wallet_getAccountAddressByNetwork'

const singleQuerySchema = [
  map,
  {closed: true},
  ['accountId', dbid],
  ['networkId', dbid],
]

export const schemas = {
  input: [or, singleQuerySchema, [oneOrMore, singleQuerySchema]],
}

export const permissions = {
  external: ['popup'],
  db: ['getAccountById', 'getNetworkById', 'accountAddrByNetwork'],
}

export const main = ({
  Err: {InvalidParams},
  db: {getAccountById, getNetworkById, accountAddrByNetwork},
  params,
}) => {
  if (!Array.isArray(params)) params = [params]

  const addrs = params.map(({accountId, networkId}) => {
    const account = getAccountById(accountId)
    if (!account) throw InvalidParams(`Invalid account id ${accountId}`)
    const network = getNetworkById(networkId)
    if (!network) throw InvalidParams(`Invalid network id ${networkId}`)
    return accountAddrByNetwork({account: accountId, network: networkId})
  })

  if (addrs.length === 1) return addrs[0]
  return addrs
}
