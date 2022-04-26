import {optParam} from '@fluent-wallet/spec'

export const NAME = 'eth_requestAccounts'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['inpage'],
  methods: ['wallet_requestPermissions', 'eth_accounts'],
  db: ['getOneApp'],
  scope: null,
}

export const main = async ({
  db: {getOneApp},
  rpcs: {wallet_requestPermissions, eth_accounts},
  site,
  app,
}) => {
  if (app) {
    return await eth_accounts()
  }
  const permissionsToRequest = {
    eth_accounts: {},
    wallet_crossNetworkTypeGetEthereumHexAddress: {},
  }
  const permsRes = await wallet_requestPermissions([permissionsToRequest])

  if (permsRes && !permsRes.error) {
    const newapp = getOneApp({site: site.eid})
    const addrs = await eth_accounts({app: newapp}, [])

    newapp.site?.post?.({
      event: 'accountsChanged',
      params: addrs,
    })

    return addrs
  }

  return []
}
