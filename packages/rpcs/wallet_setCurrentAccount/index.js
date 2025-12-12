import {dbid, oneOrMore} from '@fluent-wallet/spec'
import {siteRuntimeManager} from '@fluent-wallet/site-runtime-manager'

export const NAME = 'wallet_setCurrentAccount'

export const schemas = {
  input: [oneOrMore, dbid],
}

export const permissions = {
  external: ['popup'],
  methods: [],
  db: ['setCurrentAccount', 'findAddress', 'findAccount'],
}

export const main = ({
  Err: {InvalidParams},
  db: {setCurrentAccount, findAddress, findAccount},
  params: accounts,
}) => {
  const [account] = accounts.map(accountId => findAccount({accountId}))
  if (!account) throw InvalidParams(`Invalid accountId ${accounts[0]}`)

  const apps = setCurrentAccount(account)

  apps.forEach(({eid, site: {origin}}) => {
    if (!origin) return

    const addr = findAddress({
      appId: eid,
      g: {value: 1},
    })
    const posts = siteRuntimeManager.getPosts(origin) || []
    posts.forEach(post => {
      post({
        event: 'accountsChanged',
        params: [addr.value],
      })
    })
  })
}
