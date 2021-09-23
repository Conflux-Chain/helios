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
}) => {
  const permsRes = await wallet_requestPermissions([{eth_accounts: {}}])

  if (!permsRes?.error) {
    const app = getOneApp({site: site.eid})
    const {currentAccount, currentNetwork} = app
    const addr = accountAddrByNetwork({
      account: currentAccount.eid,
      network: currentNetwork.eid,
    })
    return addr.hex
  }

  return permsRes
}
