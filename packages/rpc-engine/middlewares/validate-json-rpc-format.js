import {defMiddleware} from '../middleware.js'
import {utils as rpcUtils} from '@fluent-wallet/json-rpc'
import rndId from '@fluent-wallet/random-id'
import * as jsonRpcErr from '@fluent-wallet/json-rpc-error'
import {addBreadcrumb} from '@fluent-wallet/sentry'

export default defMiddleware(({tx: {map, sideEffect, comp}}) => {
  return {
    id: 'validateAndFormatJsonRpc',
    ins: {req: {stream: '/START/node'}},
    // comp 参数都是transducer fn. 让这些transducer 从右到左依次执行
    // sideEffect的作用，就是把函数（transducer）包裹起来。然后忽略这个函数（transducer）的返回值。把入参数抛出去给下一个transducer。
    // 正常情况 应该是返回值抛给下一个transducer
    // addBreadcrumb： sentry 的面包屑埋点
    fn: comp(
      sideEffect(({req}) => {
        return addBreadcrumb({
          category: 'middleware-validateAndFormatJsonRpc',
          data: {
            method: req.method,
            rpcStack: req._rpcStack,
            internal: req._internal,
            popup: req._popup,
            inpage: req._inpage,
          },
        })
      }),
      map(({req, MODE}) => {
        req.jsonrpc = req.jsonrpc || '2.0'
        req.id = req.id ?? rndId()
        // 验证req的格式
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
