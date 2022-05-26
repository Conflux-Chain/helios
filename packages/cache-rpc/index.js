import {
  isArray,
  isFunction,
  isNumber,
  isObject,
  isString,
  isUndefined,
} from '@fluent-wallet/checks'
import {TLRUCache, LRUCache} from '@thi.ng/cache'
import EpochRefConf from '@fluent-wallet/rpc-epoch-ref'

// cache type
// 1. ttl cache
// CACHE.<network_name>.ttl
// when rpc cache config conf.type === 'ttl'
// ttl = conf.type.ttl ?? network.cacheTime
//
// 2. epoch/block cache
// CACHE.<network_name>.EPOCH
// store types:
// CACHE.<network_name>.EPOCH.<epoch/block number>
// CACHE.<network_name>.EPOCH.<epoch/block tag>
// CACHE.<network_name>.EPOCH.<default>
// EPOCH store caches each store by network.cacheTime, and only keeps latest 20 epoch/block
//
// What affects cache
// req.network.cacheTime
// rpc_cache_conf.type
// rpc_cache_conf.ttl
// rpc_cache_conf.key
// rpc_cache_conf.beforeGet
// rpc_cache_conf.afterGet
// rpc_cache_conf.beforeSet
// rpc_cache_conf.afterSet
// rpc_cache_conf.cacheTime when type is block/epoch
// EpochRefConf

let CACHE = {}

export const getCacheStore = ({network, params, method}, {type, cacheTime}) => {
  if (!CACHE[network.name]) CACHE[network.name] = {}
  const netCache = CACHE[network.name]

  if (type === 'ttl') {
    if (!netCache.TTL) netCache.TTL = new TLRUCache(null)
    return netCache.TTL
  }

  if (type === 'epoch' || type === 'block') {
    if (!netCache.EPOCH) netCache.EPOCH = new LRUCache(null, {maxlen: 20})
    const epochPos = EpochRefConf[method]
    if (epochPos === undefined)
      throw new Error(
        'Invalid cache option, no epoch/block ref pos in @fluent-wallet/rpc-epoch-ref',
      )

    const epoch = Number.isInteger(epochPos)
      ? params[epochPos] ?? 'default'
      : epochPos

    let store = netCache.EPOCH.get(epoch)
    if (!store) {
      const ttl = cacheTime ?? network.cacheTime ?? undefined
      store = new TLRUCache(null, isUndefined(ttl) ? ttl : {ttl})
      netCache.EPOCH.set(epoch, store)
    }

    return store
  }
}

export const getCacheKey = (key, req) => {
  const k = isFunction(key) ? key(req) : key
  if (isString(k)) return k
  if (isNumber(k)) return k.toString()
  if (isArray(k) || isObject(k)) return JSON.stringify(k)
  throw new Error(`Invalid cache key: ${k}`)
}

export const getCache = ({req, conf}) => {
  conf = req._cacheConf || conf
  if (isFunction(conf?.beforeGet) && !conf.beforeGet(req)) return

  if (!conf || !conf.type || !conf.key) return
  const {key} = conf

  const Cache = getCacheStore(req, conf)
  if (!Cache) {
    if (isFunction(conf?.afterGet)) return conf.afterGet(req)
    return
  }

  const k = getCacheKey(key, req)

  let c = Cache.get(k)

  if (isFunction(conf?.afterGet)) c = conf.afterGet(req, c)

  return c
}

export const setCache = ({req, res, conf}) => {
  conf = req._cacheConf || conf
  if (isFunction(conf?.beforeSet) && !conf.beforeSet(req, res)) return

  if (
    !conf ||
    !conf.type ||
    !conf.key ||
    !res // || !res.result
  )
    return

  const Cache = getCacheStore(req, conf)
  if (!Cache) return

  const {ttl, key} = conf

  const k = getCacheKey(key, req)
  Cache.set(k, res.result, ttl ?? req.network.cacheTime ?? undefined)

  if (isFunction(conf?.afterSet)) conf.afterSet(setCache, req, res)
}

export const init = () =>
  // config = {}
  {
    CACHE = {}
    return {get: getCache, set: setCache}
  }
