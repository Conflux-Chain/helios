import {dbid, map} from '@fluent-wallet/spec'

export const NAME = 'wallet_getAccountAddressByNetwork'

export const schemas = {
  input: [map, {closed: true}, ['accountId', dbid], ['networkId', dbid]],
}

export const permissions = {
  external: ['popup'],
  db: ['getAccountById', 'getNetworkById', 'accountAddrByNetwork'],
}

export const main = ({
  Err: {InvalidParams},
  db: {getAccountById, getNetworkById, accountAddrByNetwork},
  params: {accountId, networkId},
}) => {
  const account = getAccountById(accountId)
  if (!account) throw InvalidParams(`Invalid account id ${accountId}`)
  const network = getNetworkById(networkId)
  if (!network) throw InvalidParams(`Invalid network id ${networkId}`)
  const addr = accountAddrByNetwork({account: accountId, network: networkId})

  return addr
}
