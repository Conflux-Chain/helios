import * as tx from '@fluent-wallet/transducers'
import * as comp from '@fluent-wallet/compose' // eslint-disable-line import/namespace
import {addNode, node} from '@thi.ng/rstream-graph'
import * as perms from './src/permissions.js'
import * as S from '@thi.ng/rstream'

function validateMiddlewareConfig(conf = {}) {
  if (!conf.id) throw new Error('Invalid rpc middleware, id not specified')
  if (!conf.fn) throw new Error('Invalid rpc middleware, fn not specified')
}

const resolveWithFailSet = (resolveOpts = {}) =>
  S.resolve({
    fail: function (err) {
      if (this?.parent?.error) this.parent.error(err)
      else throw err
    },
    ...resolveOpts,
  })

export const defMiddleware = f => {
  const conf = f({
    tx,
    comp,
    perms,
    stream: {...S, resolve: resolveWithFailSet},
  })
  if (Array.isArray(conf)) conf.forEach(validateMiddlewareConfig)
  else validateMiddlewareConfig(conf)
  return conf
}

function addDebugLog(debugLog, id, payload) {
  if (debugLog.length === 10) {
    debugLog.pop()
  }

  const record = {...payload, mid: id}
  if (payload.req?.method) record.method = payload.req.method

  debugLog.unshift(record)

  return debugLog
}

export const addMiddleware = (graph, config = {}, middleware) => {
  const {processSpec, isProd, isTest, debugLog} = config
  if (Array.isArray(middleware))
    // eslint-disable-next-line import/namespace
    return middleware.map(comp.partial(addMiddleware, graph, config))

  const {id, ins, fn, outs} = middleware

  let newfn = fn

  if (!isProd && !isTest) {
    // comp: 从右到左依次执行函数。前一个函数的返回值作为下一个函数的参数
    newfn = tx.comp(tx.sideEffect(comp.partial(addDebugLog, debugLog, id)), fn)
  }

  const spec = processSpec({ins, fn: newfn, outs})
  spec.fn = node(newfn)
  const n = addNode(graph, null, id, spec)
  // Error handler, which will be called to handle any uncaught errors while executing ISubscriber.
  // next or a transducer function attached to the Subscription wrapping this subscriber.
  // The error handler must return true to indicate the error could be successfully handled / recovered from.If false, the subscription will go into State.
  // ERROR and stops processing any further values(plus might trigger recursive teardown of the upstream dataflow topology).
  // see: https://docs.thi.ng/umbrella/rstream/interfaces/ISubscription.html
  n.node.error = config?.errorHandler || n.node.error

  return n
}
