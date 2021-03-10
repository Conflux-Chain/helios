/**
 * @fileOverview rpc-engine
 * @name index.js
 */

// # rpc engine
import {chan} from '@cfxjs/csp'
import {comp, sideEffectP as sideEffect, mapP as map} from '@cfxjs/transducers'
import {partial} from '@thi.ng/compose'
import {utils as rpcUtils} from '@cfxjs/json-rpc'
import * as perms from './src/permissions'
import {rpcErrorHandler} from './src/error'

const request = (c, req = {}) => {
  const localChan = chan(1)
  c.write({...req, _c: localChan, __c: c})
  return localChan.read()
}

// ## check before
const validateJsonRpc = (req = {}) => {
  req.jsonrpc = req.jsonrpc || '2.0'
  req.id = req.id || 2
  if (!rpcUtils.isValidRequest(req)) throw new Error('invalid rpc request')
}

const validateRpcMethod = (rpcStore, {method} = {}) => {
  if (!method || !rpcStore[method])
    throw new Error(`Method ${method} not found`)
}

// ## inject depends on permissions
const injectRpcStore = (rpcStore, req) => {
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
}

const injectParentStore = (rpcStore, parentStore, req) => {
  const protectedStore = perms.getWalletStore(rpcStore, parentStore, req.method)

  // TODO: we need to add guard of subtree of wallet store if we want to support
  // external-loaded rpc methods
  return {
    setWalletState: (...args) => {
      if (!protectedStore.setState)
        throw new Error(`No permission to set wallet state in ${req.method}`)
      return protectedStore.setState(...args)
    },
    getWalletState: (...args) => {
      if (!protectedStore.getState)
        throw new Error(`No permission to get wallet state in ${req.method}`)
      return protectedStore.getState(...args)
    },
    ...req,
  }
}

// ## call rpc logic
const callRpcMethod = async (rpcStore, req) => [
  req,
  await rpcStore[req.method].main(req),
]

// ## after call
const wrapRpcResult = ([req, res]) => [
  req,
  {jsonrpc: '2.0', result: res || '0x1', id: req.id},
]

const returnRpcResult = ([req, res]) => req._c.write(res)

// ## rpc engine
const startChan = async c => {
  // eslint-disable-next-line no-constant-condition
  while (true) await c.read()
}

export const defRpcEngine = (store, opts = {methods: []}) => {
  const {methods} = opts
  const rpcStore = new Object() // to store rpc defination
  methods.forEach(rpc => {
    const {NAME, permissions, main} = rpc
    rpcStore[rpc.NAME] = {
      NAME,
      main,
      permissions: perms.format(permissions),
    }
  })

  const rpcTransducer = comp(
    sideEffect(validateJsonRpc), // validate request format
    sideEffect(partial(validateRpcMethod, rpcStore)), // validate rpc method
    map(partial(injectRpcStore, rpcStore)), // inject rpc store based on permissions
    map(partial(injectParentStore, rpcStore, store)), // inject wallet store based on permissions
    map(partial(callRpcMethod, rpcStore)), // call the rpc main method
    map(wrapRpcResult), // wrap the rpc result with valid rpc response format
    sideEffect(returnRpcResult), // return the rpc result to the caller
  )

  const rpcChan = chan(rpcTransducer, rpcErrorHandler)
  startChan(rpcChan)

  return {request: partial(request, rpcChan)}
}
