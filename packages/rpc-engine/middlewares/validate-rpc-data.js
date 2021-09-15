import {defMiddleware} from '../middleware.js'
import EpochRefConf from '@fluent-wallet/rpc-epoch-ref'
import * as jsonRpcErr from '@fluent-wallet/json-rpc-error'

function validateRpcMehtod({req, rpcStore}) {
  const {method} = req
  if (!method || !rpcStore[method]) {
    const err = new jsonRpcErr.MethodNotFound(`Method ${method} not found`)
    err.rpcData = req
    throw err
  }
}

function validateExternalMethod({MODE: {isProd}, req, rpcStore}) {
  const {method, _inpage, _origin, _popup, _rpcStack} = req
  const external = rpcStore[method]?.permissions?.external

  // internal only
  if (external.length === 0 && !_rpcStack) {
    const err = new jsonRpcErr.MethodNotFound(
      `Method ${method} not found, not allowed to call internal method directly`,
    )
    err.rpcData = req
    throw err
  }

  const allowInpage = external.includes('inpage')
  const allowPopup = external.includes('popup')

  if (_inpage && (!allowInpage || !_origin)) {
    const err = new jsonRpcErr.MethodNotFound(
      isProd
        ? undefined
        : !allowInpage
        ? 'Not allowd to call from inpage'
        : 'Missing _origin',
    )
    err.rpcData = req
    throw err
  }

  if (_popup && !allowPopup) {
    const err = new jsonRpcErr.MethodNotFound(
      isProd ? undefined : 'Not allowd to call from popup',
    )
    err.rpcData = req
    throw err
  }
}

const ImportMethods = [
  'wallet_importMnemonic',
  'wallet_importAddress',
  'wallet_importPrivateKey',
  'wallet_addVault',
]

function validateLockState({req, rpcStore, db}) {
  const allowLocked = rpcStore[req.method].permissions.locked
  // allow import methods when locked only if has 0 account group
  if (
    !allowLocked &&
    db.getLocked() &&
    ImportMethods.includes(req.method) &&
    !db.getAccountGroup()?.length
  )
    return

  if (
    !allowLocked &&
    // for methods allowed to be called from inpage when unlocked
    // popup the unlock ui first then call the method if user unlock the wallet
    !rpcStore[req.method].permissions.external.includes('inpage') &&
    db.getLocked()
  ) {
    const err = new jsonRpcErr.MethodNotFound(
      `Method ${req.method} not found, wallet is locked`,
    )
    err.rpcData = req
    throw err
  }
}

function validateNetworkSupport({req}) {
  const {method, network} = req

  const bothSupport =
    method.startsWith('wallet') || method.startsWith('personal')
  if (bothSupport) return

  const cfxRpc = method.startsWith('cfx')
  const startsWithEth = method.startsWith('eth')
  const startsWithNet = method.startsWith('net')
  const startsWithWeb3 = method.startsWith('web3')
  const ethRpc = startsWithEth || startsWithNet || startsWithWeb3

  if (
    (network.type === 'cfx' && ethRpc) ||
    (network.type === 'eth' && cfxRpc)
  ) {
    const err = new jsonRpcErr.MethodNotFound(
      `Method ${method} not supported by network ${network.name}`,
    )
    err.rpcData = req
    throw err
  }
}

function formatRpcSiteAndApp(arg) {
  const {req, db} = arg
  const {_origin, _inpage} = req
  if (!_inpage) return arg
  if (req.method === 'wallet_registerSiteMetadata') return arg
  const site = db.getOneSite({origin: _origin})
  req.site = site
  const app = db.getOneApp({site: site.eid})
  if (app) req.app = app
  return {...arg, req}
}

// if networkName specified, use the specified network
// if there's app, use app.currentNetwork
// v1 use wallet current network
// v2 specify network is mandatory
function formatRpcNetwork(arg) {
  const {req, db} = arg

  // req.networkName came from inpage/popup
  // in later version, we can remove all current network/account logic in bg
  // popup/inpage can (hopefully) specify target account/network in req
  if (req.networkName) req.network = db.getOneNetwork({name: req.networkName})

  if (!req.networkName) {
    const currentNetwork = db.getOneNetwork({selected: true})
    req.networkName = currentNetwork.name
    req.network = currentNetwork
  }

  // if (req.app) req.network = req.network || req.app.currentNetwork
  // else req.network = req.network || db.getOneNetwork({selected: true})

  if (!req.network) {
    const err = new jsonRpcErr.InvalidParams(
      `Invalid network name ${req.networkName}`,
    )
    err.rpcData = req
    throw err
  }
  return {...arg, req}
}

function formatEpochRef(arg) {
  const {req} = arg
  const {method, params = [], network} = req
  const epochRefPos = EpochRefConf[method]
  if (epochRefPos !== undefined && !params[epochRefPos]) {
    req.params[epochRefPos] =
      network?.type === 'cfx' ? 'latest_state' : 'latest'
    if (method === 'cfx_epochNumber') req.params[0] = 'latest_mined'
  }

  return {...arg, req}
}

export default defMiddleware(({tx: {check, comp, pluck, map, filter}}) => [
  {
    id: 'validateRpcMethod',
    ins: {
      req: {stream: '/validateAndFormatJsonRpc/node'},
    },
    fn: comp(check(validateRpcMehtod), pluck('req')),
  },
  {
    id: 'validateExternalMethod',
    ins: {
      req: {stream: '/validateRpcMethod/node'},
    },
    fn: comp(check(validateExternalMethod), pluck('req')),
  },
  {
    id: 'validateLockState',
    ins: {
      req: {stream: '/validateExternalMethod/node'},
    },
    fn: comp(check(validateLockState), pluck('req')),
  },
  {
    id: 'formatRpcSiteAndApp',
    ins: {
      req: {stream: '/validateLockState/node'},
    },
    fn: comp(map(formatRpcSiteAndApp), pluck('req')),
  },
  {
    id: 'formatRpcNetwork',
    ins: {
      req: {stream: '/formatRpcSiteAndApp/node'},
    },
    fn: comp(
      map(formatRpcNetwork),
      filter(({req}) => Boolean(req)),
      pluck('req'),
    ),
  },
  {
    id: 'formatEpochRef',
    ins: {
      req: {stream: '/formatRpcNetwork/node'},
    },
    fn: comp(map(formatEpochRef), pluck('req')),
  },
  {
    id: 'validateNetworkSupport',
    ins: {
      req: {stream: '/formatEpochRef/node'},
    },
    fn: comp(check(validateNetworkSupport), pluck('req')),
  },
  {
    id: 'validateRpcDataEnd',
    ins: {
      req: {stream: '/validateNetworkSupport/node'},
    },
    fn: comp(
      pluck('req'),
      filter(req => Boolean(req)),
    ),
  },
])
