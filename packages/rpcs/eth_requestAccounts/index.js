import {optParam} from '@fluent-wallet/spec'

export const NAME = 'eth_requestAccounts'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['inpage'],
  methods: ['wallet_requestPermissions'],
  db: ['getOneApp', 'accountAddrByNetwork'],
  scope: null,
}

export const main = async ({
  db: {getOneApp, accountAddrByNetwork},
  rpcs: {wallet_requestPermissions},
  site,
  app,
}) => {
  if (app?.currentAccount) {
    return [
      accountAddrByNetwork({
        account: app.currentAccount.eid,
        network: app.currentNetwork.eid,
      }).hex,
    ]
  }
  const permsRes = await wallet_requestPermissions([{eth_accounts: {}}])

  if (permsRes && !permsRes.error) {
    const app = getOneApp({site: site.eid})
    const {currentAccount, currentNetwork} = app
    const addr = accountAddrByNetwork({
      account: currentAccount.eid,
      network: currentNetwork.eid,
    })
    app.site?.post?.({
      event: 'accountsChanged',
      params: [addr.hex],
    })
    return [addr.hex]
  }

  return permsRes
}
