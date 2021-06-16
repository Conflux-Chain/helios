import {CFX_MAINNET_NAME} from '@cfxjs/fluent-wallet-consts'
import {defMiddleware} from '../middleware.js'
import EpochRefConf from '@cfxjs/rpc-epoch-ref'
import * as jsonRpcErr from '@cfxjs/json-rpc-error'

function validateRpcMehtod({req, rpcStore}) {
  const {method} = req
  if (!method || !rpcStore[method]) {
    const err = new jsonRpcErr.MethodNotFound(`Method ${method} not found`)
    err.rpcData = req
    throw err
  }
}

function validateInternalMethod({req, rpcStore}) {
  const {method} = req
  if (rpcStore[method]?.permissions.internal && !req._rpcStack) {
    const err = new jsonRpcErr.MethodNotFound(
      `Method ${method} not found, not allowed to call internal method directly`,
    )
    err.rpcData = req
    throw err
  }
}

function validateLockState({req, rpcStore, db}) {
  if (!rpcStore[req.method]?.permissions?.locked && db.getLocked()) {
    const err = new jsonRpcErr.MethodNotFound(
      `Method ${req.method} not found, wallet is locked`,
    )
    err.rpcData = req
    throw err
  }
}

function validateNetworkSupport({req}) {
  const {method, network} = req

  if (
    (network.type === 'cfx' && method.startsWith('eth')) ||
    (network.type === 'eth' && method.startsWith('cfx'))
  ) {
    const err = new jsonRpcErr.MethodNotFound(
      `Method ${method} not supported by network ${network.name}`,
    )
    err.rpcData = req
    throw err
  }
}

function formatRpcNetwork(arg) {
  const {req, db} = arg
  if (!req.networkName) req.networkName = CFX_MAINNET_NAME
  req.network = db.getOneNetwork({name: req.networkName})
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
  const {db, req} = arg
  req.params = req.params || []
  const {method, params = []} = req
  const epochRefPos = EpochRefConf[method]
  if (epochRefPos !== undefined && !params[epochRefPos]) {
    const network = db.getNetworkByName(req.networkName)?.[0]
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
    id: 'validateInternalMethod',
    ins: {
      req: {stream: '/validateRpcMethod/node'},
    },
    fn: comp(check(validateInternalMethod), pluck('req')),
  },
  {
    id: 'validateLockState',
    ins: {
      req: {stream: '/validateInternalMethod/node'},
    },
    fn: comp(check(validateLockState), pluck('req')),
  },
  {
    id: 'validateRpcData',
    ins: {
      req: {stream: '/validateLockState/node'},
    },
    fn: comp(
      map(formatRpcNetwork),
      filter(({req}) => Boolean(req)),
      map(formatEpochRef),
      pluck('req'),
    ),
  },
  {
    id: 'validateNetworkSupport',
    ins: {
      req: {stream: '/validateRpcData/node'},
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
