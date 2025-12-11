import {map, dbid} from '@fluent-wallet/spec'
import {siteRuntimeManager} from '@fluent-wallet/site-runtime-manager'

export const NAME = 'wallet_deleteApp'

export const schemas = {
  input: [map, {closed: true}, ['appId', dbid]],
}

export const permissions = {
  external: ['popup'],
  methods: [],
  db: ['retract', 'getAppById'],
}

export const main = ({
  Err: {InvalidParams},
  db: {getAppById, retract},
  params: {appId},
}) => {
  const app = getAppById(appId)
  if (!app) throw InvalidParams(`Invalid app id ${appId}`)
  const posts = siteRuntimeManager.getPosts(app.site.origin) || []
  posts.forEach(post => {
    post({event: 'accountsChanged', params: []})
  })
  retract(app.eid)
  return null
}
