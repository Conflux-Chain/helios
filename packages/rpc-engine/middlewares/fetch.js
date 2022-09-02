import {defMiddleware} from '@fluent-wallet/rpc-engine/middleware.js'
import {stream} from '@thi.ng/rstream'
import {initFetcher} from '@fluent-wallet/fetch-rpc'
import {chan} from '@fluent-wallet/csp'
import {init as initCache} from '@fluent-wallet/cache-rpc'
import rndId from '@fluent-wallet/random-id'
import {REGENERATE} from '@fluent-wallet/consts'
import {addBreadcrumb} from '@fluent-wallet/sentry'

const fetcher = initFetcher()

const s = stream({
  id: 'rpc-fetcher-stream',
  closeIn: false,
  closeOut: false,
  cache: false,
})

const {get: getCache, set: setCache} = initCache()

// http 请求调用rpc 方法
function fetch({id, method, params, jsonrpc, timeout, network: {endpoint}}) {
  return fetcher.post(endpoint, {
    timeout,
    searchParams: {m: method},
    json: {id, method, params, jsonrpc},
  })
}

export default defMiddleware(
  ({tx: {map, filter, comp, sideEffect}, stream: {resolve}}) => [
    {
      id: 'injectFetchFn',
      ins: {
        req: {stream: '/injectWalletDB/node'},
      },
      fn: comp(
        sideEffect(() => addBreadcrumb({category: 'middleware-injectFetchFn'})),
        map(({req}) => ({
          ...req,
          // f执行fetch方法,供main 调用
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
              // about csp see https://zhuanlan.zhihu.com/p/346048358
              const c = chan(1)
              c.onerror = reject
              // 这里当c 被write 的时候 才会resolve
              c.read().then(resolve)

              // 将参数传递给s。那么在 节点beforeFetch就可以拿到方法参数了
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
    // 看有没有缓存数据和结果
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
    // 异步请求拿数据
    {
      id: 'fetchRpc',
      ins: {
        req: {stream: '/beforeFetch/node'},
      },
      fn: comp(
        filter(({req}) => {
          return Boolean(req)
        }), // filter early resolved request
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
          // r
          // Reference another node indirectly.
          // The passed in resolve function can be used to lookup other nodes, with the same logic as above.E.g.the following spec looks up the main output of node "abc" and adds a transformed subscription, which is then used as input for current node.
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
        //缓存呐
        setCache({req, res, conf: rpcStore[req.method].cache})
        // 触发上面的 c.read().resolve
        req.resC.write(res)
      }),
    },
  ],
)
