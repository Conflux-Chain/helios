import {defMiddleware} from '../middleware.js'
import {utils as rpcUtils} from '@fluent-wallet/json-rpc'
import rndId from '@fluent-wallet/random-id'
import * as jsonRpcErr from '@fluent-wallet/json-rpc-error'
import {addBreadcrumb} from '@fluent-wallet/sentry'

export default defMiddleware(({tx: {map, sideEffect, comp}}) => {
  return {
    id: 'validateAndFormatJsonRpc',
    ins: {req: {stream: '/START/node'}},
    fn: comp(
      sideEffect(({req}) =>
        addBreadcrumb({
          category: 'middleware-validateAndFormatJsonRpc',
          description: {
            data: {
              method: req.method,
              rpcStack: req._rpcStack,
              internal: req._internal,
              popup: req._popup,
              inpage: req._inpage,
            },
          },
        }),
      ),
      map(({req, MODE}) => {
        req.jsonrpc = req.jsonrpc || '2.0'
        req.id = req.id ?? rndId()

        if (!rpcUtils.isValidRequest(req)) {
          const err = new jsonRpcErr.InvalidRequest(
            'invalid rpc request:\n' +
              JSON.stringify(
                {params: req.params, method: req.method},
                null,
                '\t',
              ) +
              '\n',
          )
          err.rpcData = req
          throw err
        }

        req.MODE = MODE
        return req
      }),
    ),
  }
})
