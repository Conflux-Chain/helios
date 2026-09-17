import {dbid, map, mapp, or, string} from '@fluent-wallet/spec'
import {chan} from '@fluent-wallet/csp'

export const NAME = 'wallet_addPendingUserAuthRequest'

export const schemas = {
  input: [
    or,
    [
      map,
      {closed: true},
      ['req', mapp],
      ['siteId', dbid],
      ['bundleId', {optional: true}, string],
    ],
    [
      map,
      {closed: true},
      ['req', mapp],
      ['appId', dbid],
      ['bundleId', {optional: true}, string],
    ],
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
    bundleId,
  },
}) {
  const requests = getAuthReq({site: siteId, app: appId})

  if (bundleId !== undefined) {
    return requests.find(
      request =>
        request.req.method === method && request.req.bundleId === bundleId,
    )
  }

  return requests.find(
    request =>
      request.req.bundleId === undefined &&
      !request.req.processed &&
      request.req.method === method &&
      JSON.stringify(request.req.params) === JSON.stringify(params),
  )
}

export const main = async args => {
  const {
    Err: {DuplicateId, InvalidParams},
    db: {t, getSiteById, getAppById, getAuthReqById},
    rpcs: {wallet_userRejectedAuthRequest},
    MODE,
    params: {
      req: {method, params},
      siteId,
      appId,
      bundleId,
    },
  } = args
  const site = getSiteById(siteId)
  const app = getAppById(appId)
  if (siteId && !site) throw InvalidParams(`Invalid site id ${siteId}`)
  if (appId && !app) throw InvalidParams(`Invalid app id ${appId}`)

  const duplicateRequest = getDupAuthReq(args)
  if (duplicateRequest) {
    if (bundleId !== undefined) {
      throw DuplicateId('Duplicate bundle id')
    }
    const result = await duplicateRequest.c.read()
    if (result instanceof Error) throw result
    return result
  }

  const c = chan(1)
  const pendingRequest = {
    method,
    params,
    ...(bundleId !== undefined ? {bundleId} : {}),
  }

  const {
    tempids: {authReqId},
  } = t([
    site && {
      eid: 'authReqId',
      authReq: {
        site: site.eid,
        req: pendingRequest,
        c,
      },
    },
    app && {
      eid: 'authReqId',
      authReq: {
        app: app.eid,
        req: pendingRequest,
        c,
      },
    },
  ])

  const {popup} = await import('@fluent-wallet/webextension')

  const w = await popup.show({
    alwaysOnTop: MODE.isProd ? true : false,
    mode: MODE,
  })
  if (MODE.isProd) {
    setTimeout(() => popup.onFocusChanged(w.id, popup.remove), 500)
  }
  popup.onRemoved(w?.id, () => {
    const authReq = getAuthReqById(authReqId)
    if (authReq && !authReq.processed) {
      wallet_userRejectedAuthRequest({errorFallThrough: true}, {authReqId})
    }
  })
  const rst = await c.read()
  if (rst instanceof Error) throw rst
  return rst
}
