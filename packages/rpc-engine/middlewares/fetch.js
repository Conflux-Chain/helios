import {defMiddleware} from '@cfxjs/rpc-engine/middleware.js'
import {stream} from '@thi.ng/rstream'
import {initFetcher} from '@cfxjs/fetch-rpc'
import {chan} from '@cfxjs/csp'
import {init as initCache} from '@cfxjs/cache-rpc'
import {isArray, isFunction, isObject, isString} from '@cfxjs/checks'

const fetcher = initFetcher()

const s = stream({
  id: 'rpc-fetcher-stream',
  closeIn: false,
  closeOut: false,
  cache: false,
})

const {get: getCache, set: setCache} = initCache()

const getCacheKey = (key, req) => {
  const k = isFunction(key) ? key(req) : key
  if (isString(k)) return k
  if (isArray(k) || isObject(k)) return JSON.stringify(k)
  throw new Error(`Invalid cache key: ${k}`)
}

const cget = (req, cache) => {
  if (!cache) return
  const {key} = cache
  const k = getCacheKey(key, req)
  const c = getCache({k, conf: cache})
  if (c) return c
}

const cset = (req, res, cache) => {
  if (!cache) return
  setCache({k: getCacheKey(cache.key, req), v: res.result, conf: cache})
}

function fetch({id, method, params, jsonrpc}) {
  return fetcher.post('https://portal-main.confluxrpc.com', {
    json: {id, method, params, jsonrpc},
  })
}

export default defMiddleware(({tx: {map, filter, comp}, stream: {resolve}}) => [
  {
    id: 'injectFetchFn',
    ins: {
      req: {stream: '/injectWalletDB/node'},
    },
    fn: map(({req}) => ({
      ...req,
      f: newReq =>
        new Promise((resolve, reject) => {
          const c = chan(1)
          c.onerror = reject
          c.read().then(resolve)

          s.next({
            id: req.id,
            method: req.method,
            ...newReq,
            jsonrpc: '2.0',
            resC: c,
          })
        }),
    })),
  },

  {
    id: 'beforeFetch',
    ins: {
      req: {stream: () => s},
    },
    fn: map(({req, rpcStore}) => {
      const {resC, jsonrpc, method} = req
      const cache = rpcStore[method].cache

      // no cache strategy
      if (!cache) return req

      const c = cget(req, cache)

      // cache found
      if (c) {
        resC.write({result: c, id: req.id, jsonrpc})
        return
      }

      return req
    }),
  },
  {
    id: 'fetchRpc',
    ins: {
      req: {stream: '/beforeFetch/node'},
    },
    fn: comp(
      filter(({req}) => Boolean(req)), // filter early resolved request
      map(({req}) =>
        fetch(req)
          .then(res => res.json())
          .then(res => ({req, res})),
      ),
    ),
  },
  {
    id: 'afterFetch',
    ins: {
      ctx: {
        stream: r =>
          r('/fetchRpc/node').subscribe(
            resolve({
              fail: function (err) {
                if (this?.parent?.error) this.parent.error(err)
                else throw err
              },
            }),
          ),
      },
    },
    fn: map(({ctx: {res, req}, rpcStore}) => {
      cset(req, res, rpcStore[req.method].cache)
      req.resC.write(res)
    }),
  },
])
