import * as spec from '@cfxjs/spec'
import {generateSchema as genPermissionSchema} from '@cfxjs/wallet-permission'

const {catn, cat, map, dbid, or, zeroOrMore} = spec

export const NAME = 'wallet_requestPermissions'

const permissionSchema = genPermissionSchema(spec)
const publicSchema = [cat, permissionSchema]

const innerSchema = [
  map,
  {closed: true, doc: 'used to approve/reject the request'},
  ['authReqId', dbid],
  ['permissions', publicSchema],
  ['accounts', [zeroOrMore, [catn, ['accountId', dbid]]]],
]

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
  db: {upsertAppPermissions, getAuthReqById, getAccountById, getOneAccount},
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
    if (!params.authReqId)
      throw InvalidParams(`Invalid auth req id ${params.authReqId}`)
    const {authReqId, permissions} = params
    const authReq = getAuthReqById(authReqId)
    if (!authReq) throw InvalidParams(`Invalid auth req id ${params.authReqId}`)
    if (!params.accounts.length)
      return await wallet_userRejectedAuthRequest({authReqId})

    const accounts = params.accounts.map(getAccountById)
    for (let i = 0; i < accounts.length; i++) {
      if (!accounts[i])
        throw InvalidParams(`Invalid account id ${params.accounts[i]}`)
    }
    const {site} = authReq
    let currentAccount = getOneAccount({selected: true}).eid
    if (!accounts.includes(currentAccount)) currentAccount = accounts[0].eid

    const perms = formatPermissions(permissions)
    upsertAppPermissions({
      siteId: site.eid,
      accounts: accounts.map(a => a.eid),
      currentAccount,
      currentNetwork: network.eid,
      perms: perms[0],
    })

    return await wallet_userApprovedAuthRequest({authReqId, res: perms})
  }
}
