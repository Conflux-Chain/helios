import {optParam} from '@fluent-wallet/spec'

export const NAME = 'cfx_requestAccounts'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['inpage'],
  methods: ['wallet_requestPermissions'],
  db: ['getOneApp', 'accountAddrByNetwork'],
  // TODO: this should be wallet_accounts, set it to null to make it compatible with metamask
  scope: null,
}

export const main = async ({
  db: {getOneApp, accountAddrByNetwork},
  rpcs: {wallet_requestPermissions},
  site,
}) => {
  const permsRes = await wallet_requestPermissions([{cfx_accounts: {}}])

  if (permsRes && !permsRes.error) {
    const app = getOneApp({site: site.eid})
    const {currentAccount, currentNetwork} = app
    const addr = accountAddrByNetwork({
      account: currentAccount.eid,
      network: currentNetwork.eid,
    })
    return addr.base32
  }

  return permsRes
}
