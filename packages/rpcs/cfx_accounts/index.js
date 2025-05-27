import {optParam, or, chainId, map} from '@fluent-wallet/spec'

export const NAME = 'cfx_accounts'

export const schemas = {
  input: [or, [map, {closed: true}, ['chainId', chainId]], optParam],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  db: ['getLocked', 'findAddress', 'getOneNetwork'],
}

export const main = async ({
  db: {getLocked, findAddress, getOneNetwork},
  app,
  network,
  _inpage,
  params,
}) => {
  if (getLocked()) return []
  if (_inpage && !app) return []

  if (app && getOneNetwork({selected: true}).type !== 'cfx') {
    const addr = findAddress({
      accountId: app.currentAccount.eid,
      networkId: getOneNetwork({
        type: 'cfx',
        chainId: params?.chainId || '0x405',
      }).eid,
      g: {value: 1},
    })
    if (addr) return [addr.value]
    else return []
  }

  const addrs = findAddress({
    appId: app?.eid,
    networkId: app ? app.currentNetwork.eid : network.eid,
    g: {value: 1},
  })

  if (app) {
    return [addrs.value]
  }

  return addrs.map(({value}) => value)
}
