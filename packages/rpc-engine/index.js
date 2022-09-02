// # rpc engine
import {stream} from '@thi.ng/rstream'
import {partial, identity} from '@fluent-wallet/compose'
import {chan} from '@fluent-wallet/csp'
import {rpcErrorHandlerFactory} from './src/error.js'
import * as perms from './src/permissions.js'
import * as jsonRpcErr from '@fluent-wallet/json-rpc-error'
import {pluck} from '@fluent-wallet/transducers'
import * as middlewares from './middlewares/index.js'
import {addMiddleware} from './middleware.js'
import {node, initGraph} from '@thi.ng/rstream-graph'

const wrapRpcError =
  (methodName, ErrConstructor) =>
  (errorMessage, rpcData = {}) => {
    const error = new ErrConstructor(
      `${errorMessage || ''} - [${methodName}]`,
      rpcData,
    )
    jsonRpcErr.errorStackPop(error)
    error.extra = {}
    return error
  }

const request = (s, req = {}) => {
  const localChan = chan(1)
  // 触发stream.next
  s.next.call(s, {...req, _c: localChan, __s: s})
  return localChan.read()
}

const defRpcEngineFactory = (db, options = {methods: []}) => {
  const {methods, isProd = true, isDev, isTest, isCI} = options
  const rpcStore = new Object() // to store rpc definition

  methods.forEach(rpc => {
    const {NAME, permissions, main, schemas = {}, cache} = rpc
    rpcStore[rpc.NAME] = {
      Err: {
        Parse: wrapRpcError(rpc.NAME, jsonRpcErr.Parse),
        InvalidRequest: wrapRpcError(rpc.NAME, jsonRpcErr.InvalidRequest),
        MethodNotFound: wrapRpcError(rpc.NAME, jsonRpcErr.MethodNotFound),
        InvalidParams: wrapRpcError(rpc.NAME, jsonRpcErr.InvalidParams),
        Internal: wrapRpcError(rpc.NAME, jsonRpcErr.Internal),
        Server: wrapRpcError(rpc.NAME, jsonRpcErr.Server),
        UserRejected: wrapRpcError(rpc.NAME, jsonRpcErr.UserRejected),
        Unauthorized: wrapRpcError(rpc.NAME, jsonRpcErr.Unauthorized),
        UnsupportedMethod: wrapRpcError(rpc.NAME, jsonRpcErr.UnsupportedMethod),
        Disconnected: wrapRpcError(rpc.NAME, jsonRpcErr.Disconnected),
        UnrecognizedChainId: wrapRpcError(
          rpc.NAME,
          jsonRpcErr.UnrecognizedChainId,
        ),
        ChainDisconnected: wrapRpcError(rpc.NAME, jsonRpcErr.ChainDisconnected),
      },
      NAME,
      schemas,
      cache,
      main: async (...args) => main(...args),
      // 把permissions深拷贝一份。并且给了一些默认值
      permissions: perms.format(permissions),
    }
  })

  const _debugLog = []
  const s = stream({
    id: 'rpc-engine',
    closeIn: false,
    closeOut: false,
    cache: false,
    error: rpcErrorHandlerFactory({
      isProd,
      debugLog: _debugLog,
      sentryCapture: options?.sentryCapture || identity,
    }),
  })

  // partial(fn, ...args) = () => (...x) => fn(...args,...x)
  // 这里相当于 (...rest) => request(s).bind(null,...rest)
  const sendNewRpcRequest = partial(request, s)

  // init 图表
  const g = initGraph(
    {},
    {
      START: {
        // 入参
        ins: {
          req: {
            stream: () => s,
          },
        },
        // node 第一个形参 xform。所有的子监听器只能拿到transform以后的数据即 req
        // 这里的目的是拿到上面那个stream 并输出出去。
        fn: node(pluck('req')),
      },
    },
  )

  // 这种代码 写的有副作用 不太好。最好是写成纯函数。拿到外面去声明
  const processSpec = ({ins, fn, outs}) => ({
    ins: {
      ...ins,
      MODE: {const: {isProd, isDev, isTest, isCI}},
      db: {const: db},
      rpcStore: {const: rpcStore},
      sendNewRpcRequest: {const: () => sendNewRpcRequest},
    },
    fn,
    outs,
  })
  // 职责链
  const addM = partial(addMiddleware, g, {
    debugLog: _debugLog,
    isProd,
    isTest,
    processSpec,
    errorHandler: s.error.bind(s),
  })

  addM(middlewares.validateJsonRpcFormatMiddleware)
  addM(middlewares.validateRpcDataMiddleware)
  addM(middlewares.injectRpcStoreMiddleware)
  // 把需要调用的db的方法名 给 key db
  addM(middlewares.injectWalletDBMiddleware)
  // fetch rpc数据。定义了一个f的方法。作为main的参数来调用
  addM(middlewares.fetchMiddleware)
  //根据schemas验证input
  addM(middlewares.validateRpcParamsMiddleware)
  // 执行main 方法。并触发上面的localChan.read()将返回值带回来
  addM(middlewares.callRpcMiddleware)

  return {request: sendNewRpcRequest}
}

export const defRpcEngine = defRpcEngineFactory
