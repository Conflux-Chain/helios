import {dbid, map, mapp, or} from '@fluent-wallet/spec'
import {chan} from '@fluent-wallet/csp'

export const NAME = 'wallet_addPendingUserAuthRequest'

export const schemas = {
  input: [
    or,
    [map, {closed: true}, ['req', mapp], ['siteId', dbid]],
    [map, {closed: true}, ['req', mapp], ['appId', dbid]],
  ],
}

export const permissions = {
  methods: [],
  db: ['t', 'getSiteById', 'getAppById'],
}

export const main = async ({
  Err: {InvalidParams},
  db: {t, getSiteById, getAppById},
  params: {
    req: {method, params},
    siteId,
    appId,
  },
}) => {
  const site = getSiteById(siteId)
  const app = getAppById(appId)
  if (siteId && !site) throw InvalidParams(`Invalid site id ${siteId}`)
  if (appId && !app) throw InvalidParams(`Invalid app id ${appId}`)

  const c = chan(1)
  t([
    site && {authReq: {site: site.eid, req: {method, params}, c}},
    app && {authReq: {app: app.eid, req: {method, params}, c}},
  ])

  const rst = await c.read()
  if (rst instanceof Error) throw rst
  return rst
}
