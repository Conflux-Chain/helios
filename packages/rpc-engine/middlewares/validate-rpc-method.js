import {defMiddleware} from '../middleware.js'

function validate(MethodNotFound, {req, rpcStore}) {
  const {method} = req
  if (!method || !rpcStore[method])
    throw new MethodNotFound(`Method ${method} not found`)
}

export default defMiddleware(
  ({tx: {check, comp, pluck}, comp: {partial}, err: MethodNotFound}) => ({
    id: 'validateRpcMethod',
    ins: {
      req: {stream: '/validateAndFormatJsonRpc/node'},
    },
    fn: comp(check(partial(validate, MethodNotFound)), pluck('req')),
  }),
)
