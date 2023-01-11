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
  db: ['t', 'getSiteById', 'getAppById', 'getAuthReqById', 'getAuthReq'],
}

function getDupAuthReq({
  db: {getAuthReq},
  params: {
    req: {method, params},
    siteId,
    appId,
  },
}) {
  const reqs = getAuthReq({site: siteId, app: appId})
  return reqs.filter(
    r =>
      !r.req.processed &&
      r.req.method === method &&
      JSON.stringify(r.req.params) === JSON.stringify(params),
  )[0]
}

export const main = async args => {
  const {
    Err: {InvalidParams},
    db: {t, getSiteById, getAppById, getAuthReqById},
    rpcs: {wallet_userRejectedAuthRequest},
    MODE,
    params: {
      req: {method, params},
      siteId,
      appId,
    },
  } = args
  const site = getSiteById(siteId)
  const app = getAppById(appId)
  if (siteId && !site) throw InvalidParams(`Invalid site id ${siteId}`)
  if (appId && !app) throw InvalidParams(`Invalid app id ${appId}`)

  const dupReq = getDupAuthReq(args)
  if (dupReq) {
    const rst = await dupReq.c.read()
    if (rst instanceof Error) throw rst
    return rst
  }
  // csp 线程
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
  if (MODE.isProd)
    setTimeout(() => popup.onFocusChanged(w.id, popup.remove), 500)
  popup.onRemoved(w?.id, () => {
    const authReq = getAuthReqById(authReqId)
    if (authReq && !authReq.processed)
      wallet_userRejectedAuthRequest({errorFallThrough: true}, {authReqId})
  })
  const rst = await c.read()
  if (rst instanceof Error) throw rst
  return rst
}
