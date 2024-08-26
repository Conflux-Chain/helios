import {defMiddleware} from '@fluent-wallet/rpc-engine/middleware.js'
import {stream} from '@thi.ng/rstream'
import {initFetcher} from '@fluent-wallet/fetch-rpc'
import {chan} from '@fluent-wallet/csp'
import {init as initCache} from '@fluent-wallet/cache-rpc'
import rndId from '@fluent-wallet/random-id'
import {REGENERATE} from '@fluent-wallet/consts'

const fetcher = initFetcher()

const s = stream({
  id: 'rpc-fetcher-stream',
  closeIn: false,
  closeOut: false,
  cache: false,
})

const {get: getCache, set: setCache} = initCache()

function fetch({id, method, params, jsonrpc, timeout, network: {endpoint}}) {
  return fetcher.post(endpoint, {
    timeout,
    searchParams: {m: method},
    json: {id, method, params, jsonrpc},
  })
}

export default defMiddleware(({tx: {map, filter, comp}, stream: {resolve}}) => [
  {
    id: 'injectFetchFn',
    ins: {
      req: {stream: '/injectWalletDB/node'},
    },
    fn: comp(
      map(({req}) => ({
        ...req,
        f: (...args) => {
          let params
          let overrides = {}
          if (args.length === 1) {
            params = args[0]
          } else if (args.length === 2) {
            params = args[1]
            overrides = args[0]
            if (overrides.id === REGENERATE) overrides.id = rndId()
          }

          return new Promise((resolve, reject) => {
            const c = chan(1)
            c.onerror = reject
            c.read().then(resolve)

            s.next({
              ...req,
              params,
              ...overrides,
              jsonrpc: '2.0',
              resC: c,
            })
          })
        },
      })),
    ),
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

      const c = getCache({req, conf: cache})

      // cache found
      if (c !== undefined) {
        resC.write({result: c, id: req.id, jsonrpc})
        return
      }

      const network = req.network
      return {...req, network}
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
          .then(res => ({req, res}))
          .catch(err => {
            if (req.errorFallThrough) {
              req.resC.onerror(err)
              return {req}
            }
            throw err
          }),
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
      if (!res) return
      setCache({req, res, conf: rpcStore[req.method].cache})
      req.resC.write(res)
    }),
  },
])
