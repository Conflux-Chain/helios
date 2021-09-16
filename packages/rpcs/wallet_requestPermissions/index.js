import * as spec from '@fluent-wallet/spec'
import {generateSchema as genPermissionSchema} from '@fluent-wallet/wallet-permission'

const {catn, cat, map, dbid, or, zeroOrMore, oneOrMore} = spec

export const NAME = 'wallet_requestPermissions'

const permissionSchema = genPermissionSchema(spec)
const publicSchema = [cat, permissionSchema]

const responseToAppAuthSchema = [
  map,
  {closed: true, doc: 'used to approve/reject the request'},
  ['authReqId', dbid],
  ['permissions', publicSchema],
  ['accounts', [zeroOrMore, [catn, ['accountId', dbid]]]],
]
const authWithinWalletSchema = [
  map,
  {closed: true, doc: 'used to grant permissions to app from wallet'},
  ['siteId', dbid],
  ['permissions', publicSchema],
  ['accounts', [oneOrMore, [catn, ['accountId', dbid]]]],
]
const innerSchema = [or, responseToAppAuthSchema, authWithinWalletSchema]

export const schemas = {
  input: [or, publicSchema, innerSchema],
}

export const permissions = {
  external: ['inpage', 'popup'],
  methods: [
    'wallet_addPendingUserAuthRequest',
    'wallet_userApprovedAuthRequest',
    'wallet_userRejectedAuthRequest',
  ],
  db: [
    'upsertAppPermissions',
    'getSiteById',
    'getOneSite',
    'getAuthReqById',
    'getOneAccount',
    'getAccountById',
  ],
  scope: null,
}

const formatPermissions = perms => {
  return perms.map(p =>
    Object.keys(p).reduce(
      (p, key) => {
        if (key === 'cfx_accounts' || key === 'eth_accounts')
          key = 'wallet_accounts'
        return {...p, [key]: {}}
      },
      {wallet_basic: {}},
    ),
  )
}

export const main = async ({
  Err: {InvalidRequest, InvalidParams},
  db: {
    upsertAppPermissions,
    getAuthReqById,
    getAccountById,
    getOneAccount,
    getSiteById,
  },
  rpcs: {
    wallet_addPendingUserAuthRequest,
    wallet_userApprovedAuthRequest,
    wallet_userRejectedAuthRequest,
  },
  network,
  params,
  _popup,
  _internal,
  _inpage,
  _origin,
  site,
  app,
}) => {
  if ((_inpage || _internal) && !_origin)
    throw InvalidRequest(`no origin found`)
  if (_inpage || _internal) {
    const perms = formatPermissions(params)
    if (app && JSON.stringify(app.perms) === JSON.stringify(perms))
      return app.perms

    const req = {
      method: NAME,
      params: perms,
    }

    return await wallet_addPendingUserAuthRequest({siteId: site.eid, req})
  }

  if (_popup) {
    if (params.siteId && !params.accounts.length)
      throw InvalidParams('Must have at least 1 accounts')

    const {authReqId, permissions} = params

    let siteId = params.siteId

    if (authReqId) {
      const authReq = getAuthReqById(authReqId)
      if (!authReq) throw InvalidParams(`Invalid auth req id ${authReqId}`)
      if (!params.accounts.length)
        return await wallet_userRejectedAuthRequest({authReqId})

      siteId = authReq.site.eid
    }

    if (siteId && !getSiteById(siteId))
      throw InvalidParams(`Invalid site id ${siteId}`)

    const accounts = params.accounts.map(getAccountById)

    for (let i = 0; i < accounts.length; i++) {
      if (!accounts[i])
        throw InvalidParams(`Invalid account id ${params.accounts[i]}`)
    }

    let currentAccount = getOneAccount({selected: true}).eid
    if (!accounts.includes(currentAccount)) currentAccount = accounts[0].eid

    const perms = formatPermissions(permissions)
    upsertAppPermissions({
      siteId,
      accounts: accounts.map(a => a.eid),
      currentAccount,
      currentNetwork: network.eid,
      perms: perms[0],
    })

    if (authReqId)
      return await wallet_userApprovedAuthRequest({authReqId, res: perms})

    return null
  }
}
