import {
  isArray,
  isFunction,
  isNumber,
  isObject,
  isString,
} from '@fluent-wallet/checks'
import {TLRUCache, LRUCache} from '@thi.ng/cache'
import EpochRefConf from '@fluent-wallet/rpc-epoch-ref'

let CACHE = {}

export const getCacheStore = ({network, params, method}, {type}) => {
  if (!CACHE[network.name]) CACHE[network.name] = {}
  const netCache = CACHE[network.name]

  if (type === 'ttl') {
    if (!netCache.TTL) netCache.TTL = new TLRUCache(null)
    return netCache.TTL
  }

  if (type === 'epoch' || type === 'block') {
    if (!netCache.EPOCH) netCache.EPOCH = new LRUCache(null, {maxsize: 20})
    const epochPos = EpochRefConf[method]
    if (epochPos === undefined)
      throw new Error(
        'Invalid cache option, no epoch/block ref pos in @fluent-wallet/rpc-epoch-ref',
      )
    let epoch = params[epochPos] ?? 'default'

    // epoch is latest...
    if (!epoch.startsWith('0x')) {
      epoch = getCacheStore({network}, {type: 'ttl'}).get(`EPOCH${epoch}`)
      if (epoch) params[epochPos] = epoch
    }

    let store = netCache.EPOCH.get(epoch)
    if (!store) store = new TLRUCache()
    netCache.EPOCH.set(epoch, store)

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
  if (isFunction(conf?.beforeSet) && !conf.beforeSet(req, res)) return

  if (!conf || !conf.type || !conf.key || !res || !res.result) return
  const {ttl, key} = conf

  const Cache = getCacheStore(req, conf)
  if (!Cache) return

  const k = getCacheKey(key, req)
  Cache.set(k, res.result, ttl)

  if (isFunction(conf?.afterSet)) conf.afterSet(setCache, req, res)
}

export const init = () =>
  // config = {}
  {
    CACHE = {}
    return {get: getCache, set: setCache}
  }
