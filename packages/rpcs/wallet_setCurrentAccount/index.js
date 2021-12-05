import {dbid, oneOrMore} from '@fluent-wallet/spec'

export const NAME = 'wallet_setCurrentAccount'

export const schemas = {
  input: [oneOrMore, dbid],
}

export const permissions = {
  external: ['popup'],
  methods: [],
  db: ['setCurrentAccount', 'accountAddrByNetwork', 'findAccount'],
}

export const main = ({
  Err: {InvalidParams},
  db: {setCurrentAccount, accountAddrByNetwork, findAccount},
  params: accounts,
}) => {
  const [account] = accounts.map(accountId =>
    findAccount({accountId, g: {account: {eid: 1}}}),
  )
  if (!account) throw InvalidParams(`Invalid accountId ${accounts[0]}`)

  const apps = setCurrentAccount(account.id)

  apps.forEach(({currentAccount, currentNetwork, site: {post}}) => {
    if (!post) return
    const addr = accountAddrByNetwork({
      account: currentAccount.eid,
      network: currentNetwork.eid,
    })
    post({
      event: 'accountsChanged',
      params: [addr.value],
    })
  })
}
