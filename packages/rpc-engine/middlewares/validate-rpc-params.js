import {defMiddleware} from '../middleware.js'
import {validate, explain} from '@cfxjs/spec'

export default defMiddleware(({tx: {map}}) => ({
  id: 'validateRpcParams',
  ins: {
    req: {stream: '/injectFetchFn/node'},
  },
  fn: map(({rpcStore, req}) => {
    const {params, method} = req
    const {schemas, Err} = rpcStore[method]
    if (schemas.input) {
      if (!validate(schemas.input, params, {netId: req.network.netId}))
        throw Err.InvalidParams(
          `input params:\n${JSON.stringify(
            params,
            null,
            '\t',
          )}\n\nError:\n${JSON.stringify(
            explain(schemas.input, params),
            null,
            '\t',
          )}`,
          req,
        )
    }

    return req
  }),
}))
