// # rpc engine
import {stream, resolve} from '@thi.ng/rstream'
import {identity, partial} from '@cfxjs/compose'
import {chan} from '@cfxjs/csp'
import {defError} from '@cfxjs/errors'
import {utils as rpcUtils} from '@cfxjs/json-rpc'
import {validate, explain} from '@cfxjs/spec'
import {rpcErrorHandlerFactory} from './src/error'
import rndId from '@cfxjs/random-id'
import * as perms from './src/permissions'
import * as jsonRpcErr from '@cfxjs/json-rpc-error'

export const RpcEngineError = defError(() => '[@cfxjs/rpc-engin] ', identity)

const wrapRpcError = (methodName, ErrConstructor) => errorMessage => {
  const error = new ErrConstructor(`In method ${methodName}\n${errorMessage}`)
  jsonRpcErr.errorStackPop(error)
  return error
}

const request = (s, req = {}) => {
  const localChan = chan(1)
  s.next.call(s, {req, _c: localChan, __s: s})
  return localChan.read()
}

// TODO: move rpc handlers elsewhere and add tests
const rpcHandlers = [
  {
    name: 'validateJsonRpc',
    main(_, {req}) {
      req.jsonrpc = req.jsonrpc || '2.0'
      req.id = req.id ?? rndId()
      if (!rpcUtils.isValidRequest(req))
        throw new jsonRpcErr.InvalidRequest(
          'invalid rpc request:\n' +
            JSON.stringify(
              {
                method: req.method,
                params: req.params,
                jsonrpc: req.jsonrpc,
                id: req.id,
              },
              null,
              '\t',
            ) +
            '\n',
        )
    },
    sideEffect: true,
  },
  {
    name: 'validateRpcMethod',
    main({rpcStore}, {req}) {
      const {method} = req
      if (!method || !rpcStore[method])
        throw new jsonRpcErr.MethodNotFound(`Method ${method} not found`)
    },
    sideEffect: true,
  },
  {
    name: 'injectRpcStore',
    sideEffect: false,
    async main({rpcStore}, ctx) {
      const {req, __s} = ctx
      // __s is the outmost rpc stream
      const {method} = req

      // record the rpc trace
      const _rpcStack = req._rpcStack || []
      _rpcStack.push(method)

      return {
        ...ctx,
        req: {
          ...rpcStore[method],
          ...req,
          _rpcStack,

          // wrap the rpc store into a proxy to protect against permisionless rpc calls
          // this will be called when access rpc_method_name form rpcs in rpc main function
          // eg.
          //     const {cfx_sendTransaction} = rpcs
          //     const tmp = rpcs.cfx_sendTransaction
          //     rpcs.cfx_sendTransaction(...)
          rpcs: new Proxy(rpcStore, {
            get() {
              const targetRpcName = arguments[1]

              if (!perms.getRpc(rpcStore, req.method, targetRpcName))
                throw new jsonRpcErr.InvalidRequest(
                  `No permission to call method ${targetRpcName} in ${req.method}`,
                )
              _rpcStack.push(targetRpcName)

              return params => {
                const req = {method: targetRpcName, params, _rpcStack}
                return request(__s, req).then(res => res.result)
              }
            },
            set() {
              throw new jsonRpcErr.InvalidRequest(
                'Invalid operation: no permission to alter rpc store',
              )
            },
          }),
        },
      }
    },
  },
  {
    name: 'injectWalletDB',
    async main({rpcStore, db}, ctx) {
      const {req} = ctx
      const protectedDB = perms.getWalletDB(rpcStore, db, req.method)

      return {
        ...ctx,
        req: {
          db: protectedDB,
          ...req,
        },
      }
    },
  },
  {
    name: 'validateParams',
    main({rpcStore}, {req}) {
      const {params, method} = req
      const {schemas, Err} = rpcStore[method]
      if (schemas.input && !validate(schemas.input, params)) {
        // TODO: make error message more readable
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
        )
      }
    },
    sideEffect: true,
  },
  {
    name: 'callRpc',
    async main({rpcStore}, ctx) {
      const {req} = ctx
      return {...ctx, res: await rpcStore[req.method].main(req)}
    },
  },
  {
    name: 'wrapRpcResult',
    async main(_, ctx) {
      const {req, res} = ctx
      return {...ctx, res: {jsonrpc: '2.0', result: res || '0x1', id: req.id}}
    },
  },
  {
    name: 'returnRpcResult',
    main(_, {res, _c}) {
      _c.write(res)
    },
    sideEffect: true,
  },
]

const defRpcEngineFactory = (handlers = [], db, options = {methods: []}) => {
  const {methods, isDev = false} = options
  const rpcStore = new Object() // to store rpc defination

  methods.forEach(rpc => {
    const {NAME, permissions, main, schemas = {}} = rpc
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

  // register handlers
  handlers.reduce((sub, {name, main, sideEffect}) => {
    if (sideEffect)
      return sub
        .map(
          async ctx => {
            try {
              await main({db, rpcStore}, ctx)
              return ctx
            } catch (err) {
              throw {err, ctx}
            }
          },
          {id: name, error: s.error.bind(s)},
        )
        .subscribe(resolve({id: `resolve-${name}`, fail: s.error.bind(s)}), {
          error: s.error.bind(s),
        })

    return sub
      .map(
        async ctx => {
          try {
            return await main({db, rpcStore}, ctx)
          } catch (err) {
            throw {err, ctx}
          }
        },
        {
          id: name,
          error: s.error.bind(s),
        },
      )
      .subscribe(resolve({id: `resolve-${name}`, fail: s.error.bind(s)}))
  }, s)

  return {request: partial(request, s)}
}

export const defRpcEngine = partial(defRpcEngineFactory, rpcHandlers)
