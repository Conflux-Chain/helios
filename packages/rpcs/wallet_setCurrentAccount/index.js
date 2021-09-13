import {catn, dbid} from '@fluent-wallet/spec'

export const NAME = 'wallet_setCurrentAccount'

export const schemas = {
  input: [catn, ['accountId', dbid]],
}

export const permissions = {
  external: ['popup'],
  methods: [],
  db: ['setCurrentAccount', 'getAccountById', 'accountAddrByNetwork'],
}

export const main = ({
  Err: {InvalidParams},
  db: {setCurrentAccount, getAccountById, accountAddrByNetwork},
  params: accounts,
}) => {
  const [account] = accounts
  if (!getAccountById(account))
    throw InvalidParams(`Invalid accountId ${account}`)

  const apps = setCurrentAccount(account)

  apps.forEach(({currentAccount, currentNetwork, site: {post}}) => {
    if (!post) return
    const addr = accountAddrByNetwork({
      account: currentAccount.eid,
      network: currentNetwork.eid,
    })
    post({
      event: 'accountsChanged',
      params: [currentNetwork.type === 'cfx' ? addr.base32 : addr.hex],
    })
  })
}
