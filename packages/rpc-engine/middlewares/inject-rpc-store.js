import {defMiddleware} from '../middleware.js'

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
function defRpcProxy({
  getRpcPermissions,
  InvalidRequestErr,
  rpcStore,
  req,
  sendNewRpcRequest,
}) {
  return new Proxy(rpcStore, {
    get() {
      const targetRpcName = arguments[1]

      if (!getRpcPermissions(rpcStore, req.method, targetRpcName))
        throw new InvalidRequestErr(
          `No permission to call method ${targetRpcName} in ${req.method}`,
        )
      req._rpcStack.push(targetRpcName)

      return params => {
        return sendNewRpcRequest({
          method: targetRpcName,
          params,
          _rpcStack: req._rpcStack,
        }).then(res => res.result)
      }
    },
    set() {
      throw new InvalidRequestErr(
        'Invalid operation: no permission to alter rpc store',
      )
    },
  })
}

export default defMiddleware(
  ({perms: {getRpc}, tx: {map, comp, sideEffect}, err: {InvalidRequest}}) => ({
    id: 'injectRpcStore',
    ins: {req: {stream: '/validateRpcMethod/node'}},
    fn: comp(
      sideEffect(({req}) => updateReqRpcStack(req)),
      map(({sendNewRpcRequest, req, rpcStore}) => ({
        ...req,
        ...rpcStore[req.method],
        rpcs: defRpcProxy({
          getRpcPermissions: getRpc,
          InvalidRequestErr: InvalidRequest,
          rpcStore,
          req,
          sendNewRpcRequest,
        }),
      })),
    ),
  }),
)
