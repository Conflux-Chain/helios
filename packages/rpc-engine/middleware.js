import * as tx from '@cfxjs/transducers'
import * as jsonRpcErr from '@cfxjs/json-rpc-error'
import * as comp from '@cfxjs/compose' // eslint-disable-line import/namespace
import {addNode, node} from '@thi.ng/rstream-graph'
import * as perms from './src/permissions.js'
import {resolve} from '@thi.ng/rstream'

function validateMiddlewareConfig(conf = {}) {
  if (!conf.id) throw new Error('Invalid rpc middleware, id not specified')
  if (!conf.fn) throw new Error('Invalid rpc middleware, fn not specified')
}

const resolveWithFailSet = (resolveOpts = {}) =>
  resolve({
    fail: function (err) {
      if (this?.parent?.error) this.parent.error(err)
      else throw err
    },
    ...resolveOpts,
  })

export const defMiddleware = f => {
  const conf = f({
    tx,
    err: jsonRpcErr,
    comp,
    perms,
    stream: {resolve: resolveWithFailSet},
  })
  if (Array.isArray(conf)) conf.forEach(validateMiddlewareConfig)
  else validateMiddlewareConfig(conf)
  return conf
}

export const addMiddleware = (graph, config = {}, middleware) => {
  const {processSpec} = config
  if (Array.isArray(middleware))
    // eslint-disable-next-line import/namespace
    return middleware.map(comp.partial(addMiddleware, graph, config))

  const {id, ins, fn, outs} = middleware
  const spec = processSpec({ins, fn, outs})
  spec.fn = node(fn)
  const n = addNode(graph, null, id, spec)
  n.node.error = config?.errorHandler || n.node.error

  return n
}
