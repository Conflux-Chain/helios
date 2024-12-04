import {optParam} from '@fluent-wallet/spec'

export const NAME = 'cfx_requestAccounts'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['inpage'],
  methods: ['wallet_requestPermissions', 'cfx_accounts'],
  db: ['getOneApp'],
  scope: null,
}

export const main = async ({
  db: {getOneApp},
  rpcs: {wallet_requestPermissions, cfx_accounts},
  site,
  app,
}) => {
  if (app) {
    return await cfx_accounts()
  }
  const permissionsToRequest = {
    cfx_accounts: {},
  }
  const permsRes = await wallet_requestPermissions([permissionsToRequest])

  if (permsRes && !permsRes.error) {
    const newapp = getOneApp({site: site.eid})
    const addrs = await cfx_accounts({app: newapp}, [])

    return addrs
  }

  return []
}
