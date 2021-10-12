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
  methods: ['wallet_userRejectedAuthRequest'],
  db: ['t', 'getSiteById', 'getAppById', 'getAuthReqById'],
}

export const main = async ({
  Err: {InvalidParams},
  db: {t, getSiteById, getAppById, getAuthReqById},
  rpcs: {wallet_userRejectedAuthRequest},
  MODE,
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
  const {
    tempids: {authReqId},
  } = t([
    site && {
      eid: 'authReqId',
      authReq: {site: site.eid, req: {method, params}, c},
    },
    app && {
      eid: 'authReqId',
      authReq: {app: app.eid, req: {method, params}, c},
    },
  ])

  const {popup} = await import('@fluent-wallet/webextension')

  const w = await popup.show({
    alwaysOnTop: MODE.isProd ? true : false,
    mode: MODE,
  })
  if (MODE.isProd) popup.onFocusChanged(w.id, popup.remove)
  popup.onRemoved(
    w.id,
    () =>
      getAuthReqById(authReqId) &&
      wallet_userRejectedAuthRequest({errorFallThrough: true}, {authReqId}),
  )
  const rst = await c.read()
  if (rst instanceof Error) throw rst
  return rst
}
