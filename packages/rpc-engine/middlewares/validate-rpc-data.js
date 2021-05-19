import {CFX_MAINNET_NAME} from '@cfxjs/fluent-wallet-consts'
import {Internal} from '@cfxjs/json-rpc-error'
import {defMiddleware} from '../middleware.js'
import EpochRefConf from '@cfxjs/rpc-epoch-ref'

function validateRpcMehtod(MethodNotFound, {req, rpcStore}) {
  const {method} = req
  if (!method || !rpcStore[method])
    throw new MethodNotFound(`Method ${method} not found`)
}

function formatRpcNetwork(InternalErr, arg) {
  const {req, db} = arg
  if (req.networkName) {
    if (db.getOneNetwork({name: req.networkName})) return arg
    // TODO: remove this check after adding network logic
    throw new InternalErr(
      `Something went wrong in wallet. Can't find network dbid ${req.networkDBID} in database`,
    )
  }

  if (!req.networkName) req.networkName = CFX_MAINNET_NAME
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

export default defMiddleware(
  ({
    tx: {check, comp, pluck, map, filter},
    comp: {partial},
    err: {MethodNotFound},
  }) => [
    {
      id: 'validateRpcMethod',
      ins: {
        req: {stream: '/validateAndFormatJsonRpc/node'},
      },
      fn: comp(check(partial(validateRpcMehtod, MethodNotFound)), pluck('req')),
    },

    {
      id: 'validateRpcData',
      ins: {
        req: {stream: '/validateRpcMethod/node'},
      },
      fn: comp(
        map(partial(formatRpcNetwork, Internal)),
        map(formatEpochRef),
        pluck('req'),
      ),
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
  ],
)
