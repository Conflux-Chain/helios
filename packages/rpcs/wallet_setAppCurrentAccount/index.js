import {map, dbid} from '@fluent-wallet/spec'
import {siteRuntimeManager} from '@fluent-wallet/site-runtime-manager'

export const NAME = 'wallet_setAppCurrentAccount'

export const schemas = {
  input: [map, {closed: true}, ['accountId', dbid], ['appId', dbid]],
}

export const permissions = {
  external: ['popup'],
  db: ['getAccountById', 'getAppById', 't', 'accountAddrByNetwork'],
}

export const main = ({
  Err: {InvalidParams},
  db: {getAccountById, t, accountAddrByNetwork, getAppById},
  params: {accountId, appId},
}) => {
  const account = getAccountById(accountId)
  if (!account) throw InvalidParams(`Invalid accountId ${accountId}`)
  const app = getAppById(appId)
  if (!app) throw InvalidParams(`Invalid app id ${appId}`)
  if (!app.account || !app.account.map(({eid}) => eid).includes(accountId))
    throw InvalidParams(
      `Account ${accountId} not authorized for app ${app.eid}`,
    )

  t([{eid: app.eid, app: {currentAccount: accountId}}])

  const {
    currentNetwork,
    site: {origin},
  } = app

  if (origin) {
    const addr = accountAddrByNetwork({
      account: accountId,
      network: currentNetwork.eid,
    })
    const posts = siteRuntimeManager.getPosts(origin) || []
    posts.forEach(post => {
      post({event: 'accountsChanged', params: [addr.value]})
    })
  }

  return
}
