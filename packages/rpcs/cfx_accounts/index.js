import {optParam} from '@fluent-wallet/spec'

export const NAME = 'cfx_accounts'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  db: ['getLocked', 'accountAddrByNetwork'],
}

export const main = async ({
  db: {getLocked, accountAddrByNetwork},
  app,
  network,
}) => {
  if (getLocked()) return []
  if (!app) return []

  const addr = accountAddrByNetwork({
    network: network.eid,
    account: app.currentAccount.eid,
  })
  if (network.type === 'cfx') return [addr.base32]
  return [addr.hex]
}
