/**
 * @fileOverview rpc-engine
 * @name index.js
 */
import {chan} from '@cfxjs/csp'
import {comp, sideEffectP as sideEffect, mapP as map} from '@cfxjs/transducers'
import {partial} from '@thi.ng/compose'
import {utils as rpcUtils} from '@cfxjs/json-rpc'

function rpcErrorHandler(err = {}, _, req) {
  err.message = err.message =
    'RPC Stack: \n-> ' + req._rpcStack.join('\n-> ') + '\n' + err.message

  req._c.write({
    jsonrpc: '2.0',
    error: {code: -32603, message: err.message, data: err},
    id: req.id || 2,
  })
}

const request = (c, req = {}) => {
  const localChan = chan(1)
  c.write({...req, _c: localChan, __c: c})
  return localChan.read()
}

function validateJsonRpc(req = {}) {
  req.jsonrpc = req.jsonrpc || '2.0'
  req.id = req.id || 2
  if (!rpcUtils.isValidRequest(req)) throw new Error('invalid rpc request')
}

function validateRpcMethod(rpcStore, {method} = {}) {
  if (!method || !rpcStore[method]) throw new Error('Method not found')
}

function injectRpcStore(rpcStore, req) {
  // __c is the outmost rpc channel
  const {method, __c} = req

  // record the rpc trace
  const _rpcStack = req._rpcStack || []
  _rpcStack.push(method)

  return {
    ...req,
    _rpcStack,

    // wrap the rpc store into a proxy to protect against permisionless rpc calls
    rpcs: new Proxy(rpcStore, {
      get() {
        const methodName = arguments[1]
        _rpcStack.push(methodName)
        return function (params) {
          const req = {method: methodName, params, _rpcStack}
          return request(__c, req)
        }
      },
    }),
  }
}

function injectParentStore(parentStore, req) {
  return {...parentStore, ...req}
}

async function callRpcMethod(rpcStore, req) {
  return [req, await rpcStore[req.method](req)]
}

function wrapRpcResult([req, res]) {
  return [req, {jsonrpc: '2.0', result: res || '0x1', id: req.id}]
}

function returnRpcResult([req, res]) {
  return req._c.write(res)
}

async function startChan(c) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await c.read()
  }
}

export function defRpcEngine(store, opts = {methods: []}) {
  const {methods} = opts
  const rpcStore = new Set() // TODO: use https://github.com/thi-ng/umbrella/tree/develop/packages/associative
  methods.forEach(rpc => (rpcStore[rpc.NAME] = rpc.main))

  const rpcTransducer = comp(
    sideEffect(validateJsonRpc), // validate request format
    sideEffect(partial(validateRpcMethod, rpcStore)), // validate rpc method
    map(partial(injectRpcStore, rpcStore)), // inject rpc store based on permissions
    map(partial(injectParentStore, store)), // inject wallet store based on permissions
    map(partial(callRpcMethod, rpcStore)), // call the rpc main method
    map(wrapRpcResult), // wrap the rpc result with valid rpc response format
    sideEffect(returnRpcResult), // return the rpc result to the caller
  )

  const rpcChan = chan(rpcTransducer, rpcErrorHandler)
  startChan(rpcChan)

  return {request: partial(request, rpcChan)}
}
