import {optParam} from '@fluent-wallet/spec'

export const NAME = 'cfx_accounts'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  db: ['getLocked', 'findAddress'],
}

export const main = async ({
  db: {getLocked, findAddress},
  app,
  network,
  _inpage,
}) => {
  if (getLocked()) return []
  if (_inpage && !app) return []

  const addrs = findAddress({
    appId: app?.eid,
    networkId: app ? null : network.eid,
    g: {address: {value: 1}},
  }).map(({value}) => value)
  return addrs
}
