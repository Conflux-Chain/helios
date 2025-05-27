import {optParam} from '@fluent-wallet/spec'

export const NAME = 'eth_accounts'

export const schemas = {
  input: optParam,
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
}) => {
  if (getLocked()) return []
  if (_inpage && !app) return []

  if (app && getOneNetwork({selected: true}).type !== 'eth') {
    // find any eth address under this account
    const addrs = findAddress({
      accountId: app.currentAccount.eid,
      networkType: 'eth',
      g: {value: 1},
    })
    const addr = addrs.reduce((rst, addr) => rst || addr?.value, null)
    if (addr) return [addr]
    else return []
  }

  const addrs = findAddress({
    appId: app?.eid,
    networkId: app ? null : network.eid,
    g: {value: 1},
  })

  if (app) {
    return [addrs.value]
  }

  return addrs.map(({value}) => value)
}
