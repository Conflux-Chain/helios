/**
 * @fileOverview rpc-engine
 * @name index.js
 */

// # rpc engine
import {identity} from '@cfxjs/compose'
import {applyTransducer, chan} from '@cfxjs/csp'
import {defError} from '@cfxjs/errors'
import {map} from '@cfxjs/iterators'
import {utils as rpcUtils} from '@cfxjs/json-rpc'
import {validate, explain} from '@cfxjs/spec'
import {
  comp as txComp,
  map as txMap,
  sideEffect as txSideEffect,
} from '@cfxjs/transducers'
import {partial} from '@thi.ng/compose'
import {rpcErrorHandler} from './src/error'
import * as perms from './src/permissions'

export const RpcEngineError = defError(() => '[@cfxjs/rpc-engin] ', identity)

const request = (c, req = {}) => {
  const localChan = chan(1)
  c.write({...req, _c: localChan, __c: c})
  return localChan.read()
}

// TODO: move rpc handlers elsewhere and add tests
const rpcHandlers = {
  before: [
    {
      name: 'validateJsonRpc',
      main(_, req) {
        req.jsonrpc = req.jsonrpc || '2.0'
        req.id = req.id || 2
        if (!rpcUtils.isValidRequest(req))
          throw new Error(
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
      main({rpcStore}, {method} = {}) {
        if (!method || !rpcStore[method])
          throw new Error(`Method ${method} not found`)
      },
      sideEffect: true,
    },
    {
      name: 'injectRpcStore',
      main({rpcStore}, req) {
        // __c is the outmost rpc channel
        const {method, __c} = req

        // record the rpc trace
        const _rpcStack = req._rpcStack || []
        _rpcStack.push(method)

        return {
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
                throw new Error(
                  `No permission to call method ${targetRpcName} in ${req.method}`,
                )
              _rpcStack.push(targetRpcName)

              return params => {
                const req = {method: targetRpcName, params, _rpcStack}
                return request(__c, req)
              }
            },
            set() {
              throw new Error(
                'Invalid operation: no permission to alter rpc store',
              )
            },
          }),
        }
      },
    },
    {
      name: 'injectWalletDB',
      main({rpcStore, db}, req) {
        const protectedDB = perms.getWalletDB(rpcStore, db, req.method)

        return {
          db: protectedDB,
          ...req,
        }
      },
    },
    {
      name: 'validateParams',
      main({rpcStore}, req) {
        const {params, method} = req
        const {schema, Err} = rpcStore[method]
        if (schema.input && !validate(schema.input, params)) {
          // TODO: make error message more readable
          throw new Err(explain(schema.input, params))
        }
      },
      sideEffect: true,
    },
    {
      name: 'beforeCallRpc',
      main({rpcStore}, req) {
        // TODO: we don't need to call every before, only those we want to validate
        // like rpcs called directly by user
        const {before} = rpcStore[req.method]
        if (before) before(req)
      },
      sideEffect: true,
    },
    {
      name: 'callRpc',
      main({rpcStore, onError, afterChan}, req) {
        rpcStore[req.method]
          .main(req)
          .then(res => afterChan.write([req, res]))
          .catch(err => onError(err, req))
      },
      sideEffect: true,
    },
  ],
  after: [
    {
      name: 'wrapRpcResult',
      main(_, [req, res]) {
        return [req, {jsonrpc: '2.0', result: res || '0x1', id: req.id}]
      },
    },
    {
      name: 'returnRpcResult',
      main(_, [req, res]) {
        req._c.write(res)
      },
      sideEffect: true,
    },
  ],
}

const startChan = async c => {
  // eslint-disable-next-line no-constant-condition
  while (true) await c.read()
}

const defRpcEngineFactory = (
  handlers = {before: [], after: []},
  db,
  options = {methods: []},
) => {
  const {methods} = options
  const rpcStore = new Object() // to store rpc defination

  methods.forEach(rpc => {
    const {NAME, permissions, main, schema = {}} = rpc
    rpcStore[rpc.NAME] = {
      Err: defError(() => `[${rpc.NAME}] `, identity),
      NAME,
      schema,
      main: async (...args) => main(...args),
      permissions: perms.format(permissions),
    }
  })

  const [beforeChan, afterChan] = [
    chan('RPC Engine - before'),
    chan('RPC Engine - after'),
  ]

  const handlerToRpcReducer = ({
    /* name, */ main,
    sideEffect: isSideEffect,
  }) => {
    const toTransducer = isSideEffect ? txSideEffect : txMap
    return toTransducer(
      partial(main, {
        beforeChan,
        afterChan,
        rpcStore,
        db,
        onError: (err, req) => rpcErrorHandler(err, undefined, req),
      }),
    )
  }

  const beforeTx = txComp(...map(handlerToRpcReducer, handlers.before))
  const afterTx = txComp(...map(handlerToRpcReducer, handlers.after))

  applyTransducer(beforeChan, beforeTx, rpcErrorHandler)
  applyTransducer(afterChan, afterTx, rpcErrorHandler)
  startChan(beforeChan)
  startChan(afterChan)

  return {request: partial(request, beforeChan)}
}

export const defRpcEngine = partial(defRpcEngineFactory, rpcHandlers)
