import {defMiddleware} from '../middleware.js'
import {validate, explain} from '@fluent-wallet/spec'
import {addBreadcrumb} from '@fluent-wallet/sentry'

export default defMiddleware(({tx: {map, comp, sideEffect}}) => ({
  id: 'validateRpcParams',
  ins: {
    req: {stream: '/injectFetchFn/node'},
  },
  fn: comp(
    sideEffect(() => addBreadcrumb({category: 'middleware-validateRpcParams'})),
    map(({rpcStore, req}) => {
      const {params, method} = req
      const {schemas, Err} = rpcStore[method]
      if (schemas.input) {
        if (!validate(schemas.input, params, {netId: req.network.netId})) {
          throw Err.InvalidParams(
            `input params:\n${JSON.stringify(
              params,
              null,
              '\t',
            )}\n\nError:\n${JSON.stringify(
              explain(schemas.input, params, {netId: req.network.netId}),
              null,
              '\t',
            )}`,
            req,
          )
        }
      }

      return req
    }),
  ),
}))
