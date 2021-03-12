/**
 * @fileOverview rpc-engine
 * @name index.js
 */

// # rpc engine
import {chan, applyTransducer} from '@cfxjs/csp'
import {
  comp as txComp,
  sideEffect as txSideEffect,
  map as txMap,
} from '@cfxjs/transducers'
import {partial} from '@thi.ng/compose'
import {utils as rpcUtils} from '@cfxjs/json-rpc'
import * as perms from './src/permissions'
import {rpcErrorHandler} from './src/error'
import {map} from '@cfxjs/iterators'

const request = (c, req = {}) => {
  const localChan = chan(1)
  c.write({...req, _c: localChan, __c: c})
  return localChan.read()
}

const rpcHandlers = {
  before: [
    {
      name: 'validateJsonRpc',
      main(_, req) {
        req.jsonrpc = req.jsonrpc || '2.0'
        req.id = req.id || 2
        if (!rpcUtils.isValidRequest(req))
          throw new Error('invalid rpc request')
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

              _rpcStack.push(targetRpcName)

              if (!perms.getRpc(rpcStore, req.method, targetRpcName))
                throw new Error(
                  `No permission to call method ${targetRpcName} in ${req.method}`,
                )

              return params => {
                const req = {method: targetRpcName, params, _rpcStack}
                return request(__c, req)
              }
            },
            set() {
              throw new Error('Invalid operation: modifiying rpc store')
            },
          }),
        }
      },
    },
    {
      name: 'injectParentStore',
      main({rpcStore, parentStore}, req) {
        const protectedStore = perms.getWalletStore(
          rpcStore,
          parentStore,
          req.method,
        )

        // TODO: we need to guard the subtree of wallet store if we want to support
        // external-loaded rpc methods
        return {
          setWalletState: (...args) => {
            if (!protectedStore.setState)
              throw new Error(
                `No permission to set wallet state in ${req.method}`,
              )
            return protectedStore.setState(...args)
          },
          getWalletState: (...args) => {
            if (!protectedStore.getState)
              throw new Error(
                `No permission to get wallet state in ${req.method}`,
              )
            return protectedStore.getState(...args)
          },
          ...req,
        }
      },
    },
    {
      name: 'callRpcMethod',
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
  parentStore,
  options = {methods: []},
) => {
  const {methods} = options
  const rpcStore = new Object() // to store rpc defination

  methods.forEach(rpc => {
    const {NAME, permissions, main} = rpc
    rpcStore[rpc.NAME] = {
      NAME,
      main,
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
        parentStore,
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
