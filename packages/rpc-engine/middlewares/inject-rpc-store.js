import {defMiddleware} from '../middleware.js'
import {parseError} from '@fluent-wallet/json-rpc-error'

function updateReqRpcStack(req) {
  const {method} = req
  const _rpcStack = req._rpcStack || []
  _rpcStack.push(method)
  req._rpcStack = _rpcStack
  return req
}

/*
  wrap the rpc store into a proxy to protect against permisionless rpc calls
  this will be called when access rpc_method_name form rpcs in rpc main function
  eg.
      const {cfx_sendTransaction} = rpcs
      const tmp = rpcs.cfx_sendTransaction
      rpcs.cfx_sendTransaction(...)
*/
function defRpcProxy({getRpcPermissions, rpcStore, req, sendNewRpcRequest}) {
  return new Proxy(rpcStore, {
    get() {
      const targetRpcName = arguments[1]
      const {InvalidRequest} = rpcStore[req.method].Err

      if (!getRpcPermissions(rpcStore, req.method, targetRpcName))
        throw InvalidRequest(
          `No permission to call method ${targetRpcName} in ${req.method}`,
          req,
        )

      return (...args) => {
        let overrides = {}
        let params
        if (args.length === 1) {
          params = args[0]
          overrides = {}
        } else if (args.length === 2) {
          overrides = args[0]
          params = args[1]
        }

        const newReq = {
          id: req.id,
          params,
          site: req.site,
          app: req.app,
          _origin: req._origin,
          network: req.network,
          networkName: req.networkName,
          _inpage: req._inpage,
          _popup: req._popup,
          ...overrides,
          method: targetRpcName,
          _rpcStack: req._rpcStack,
          _internal: true,
        }
        return sendNewRpcRequest(newReq).then(res => {
          req._rpcStack.pop()
          if (res.error) {
            if (overrides.errorFallThrough) {
              const error = parseError(res.error, '', ` - in ${targetRpcName}`)
              error.rpcData = newReq
              throw error
            }
            req._c.write(res)
          } else return res.result
        })
      }
    },
    set() {
      const {InvalidRequest} = rpcStore[req.method].Err
      throw InvalidRequest(
        'Invalid operation: no permission to alter rpc store',
        req,
      )
    },
  })
}

export default defMiddleware(
  ({perms: {getRpc}, tx: {map, comp, sideEffect}}) => ({
    id: 'injectRpcStore',
    ins: {req: {stream: '/validateRpcDataEnd/node'}},
    fn: comp(
      sideEffect(({req}) => updateReqRpcStack(req)),
      map(({sendNewRpcRequest, req, rpcStore}) => ({
        ...req,
        ...rpcStore[req.method],
        rpcs: defRpcProxy({
          getRpcPermissions: getRpc,
          rpcStore,
          req,
          sendNewRpcRequest,
        }),
      })),
    ),
  }),
)
