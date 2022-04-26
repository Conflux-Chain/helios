import {optParam} from '@fluent-wallet/spec'

export const NAME = 'eth_accounts'

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

  if (app && app.perms.wallet_crossNetworkTypeGetEthereumHexAddress) {
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
