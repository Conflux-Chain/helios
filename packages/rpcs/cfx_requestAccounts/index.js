import {optParam} from '@fluent-wallet/spec'

export const NAME = 'cfx_requestAccounts'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['inpage'],
  methods: ['wallet_requestPermissions'],
  db: ['getOneApp', 'findAddress'],
  // TODO: this should be wallet_accounts, set it to null to make it compatible with metamask
  scope: null,
}

export const main = async ({
  db: {getOneApp, findAddress},
  rpcs: {wallet_requestPermissions},
  site,
  app,
}) => {
  if (app) {
    return findAddress({appId: app.eid, g: {value: 1}}).map(({value}) => value)
  }
  const permsRes = await wallet_requestPermissions([{cfx_accounts: {}}])

  if (permsRes && !permsRes.error) {
    const newapp = getOneApp({site: site.eid})
    const addrs = findAddress({
      appId: newapp.eid,
      g: {value: 1},
    }).map(({value}) => value)

    newapp.site?.post?.({
      event: 'accountsChanged',
      params: addrs,
    })

    return addrs
  }

  return []
}
