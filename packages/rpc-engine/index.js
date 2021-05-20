// # rpc engine
import {stream} from '@thi.ng/rstream'
import {partial} from '@cfxjs/compose'
import {chan} from '@cfxjs/csp'
import {rpcErrorHandlerFactory} from './src/error.js'
import * as perms from './src/permissions.js'
import * as jsonRpcErr from '@cfxjs/json-rpc-error'
import {pluck} from '@cfxjs/transducers'
import * as middlewares from './middlewares/index.js'
import {addMiddleware} from './middleware.js'
import {node, initGraph} from '@thi.ng/rstream-graph'

const wrapRpcError =
  (methodName, ErrConstructor) =>
  (errorMessage, rpcData = {}) => {
    const error = new ErrConstructor(
      `In method ${methodName}\n${errorMessage}`,
      rpcData,
    )
    jsonRpcErr.errorStackPop(error)
    return error
  }

const request = (s, req = {}) => {
  const localChan = chan(1)
  s.next.call(s, {...req, _c: localChan, __s: s})
  return localChan.read()
}

const defRpcEngineFactory = (db, options = {methods: []}) => {
  const {methods, isDev = false} = options
  const rpcStore = new Object() // to store rpc defination

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
      },
      NAME,
      schemas,
      cache,
      main: async (...args) => main(...args),
      permissions: perms.format(permissions),
    }
  })

  const s = stream({
    id: 'rpc-engine',
    closeIn: false,
    closeOut: false,
    cache: false,
    error: rpcErrorHandlerFactory(isDev),
  })

  const sendNewRpcRequest = partial(request, s)

  const g = initGraph(
    {},
    {
      START: {
        ins: {
          req: {
            stream: () => s,
          },
        },
        fn: node(pluck('req')),
      },
    },
  )

  const processSpec = ({ins, fn, outs}) => ({
    ins: {
      ...ins,
      db: {const: db},
      rpcStore: {const: rpcStore},
      sendNewRpcRequest: {const: () => sendNewRpcRequest},
    },
    fn,
    outs,
  })

  const addM = partial(addMiddleware, g, {
    processSpec,
    errorHandler: s.error.bind(s),
  })

  addM(middlewares.validateJsonRpcFormatMiddleware)
  addM(middlewares.validateRpcDataMiddleware)
  addM(middlewares.injectRpcStoreMiddleware)
  addM(middlewares.injectWalletDBMiddleware)
  addM(middlewares.fetchMiddleware)
  addM(middlewares.validateRpcParamsMiddleware)
  addM(middlewares.callRpcMiddleware)

  return {request: sendNewRpcRequest}
}

export const defRpcEngine = defRpcEngineFactory
