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

function formatRpcNetwork(arg) {
  const {req, db} = arg
  if (!req.networkName) req.networkName = CFX_MAINNET_NAME
  req.network = db.getOneNetwork({name: req.networkName})
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
    id: 'validateRpcData',
    ins: {
      req: {stream: '/validateRpcMethod/node'},
    },
    fn: comp(map(formatRpcNetwork), map(formatEpochRef), pluck('req')),
  },
  {
    id: 'validateRpcDataEnd',
    ins: {
      req: {stream: '/validateRpcData/node'},
    },
    fn: comp(
      pluck('req'),
      filter(req => Boolean(req)),
    ),
  },
])
