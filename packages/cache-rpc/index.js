import {isArray, isFunction, isObject, isString} from '@cfxjs/checks'
import {TLRUCache, LRUCache} from '@thi.ng/cache'
import EpochRefConf from '@cfxjs/rpc-epoch-ref'

const CACHE = {}

const getCacheStore = ({networkName, params, method}, {type}) => {
  if (!CACHE[networkName]) CACHE[networkName] = {}
  const netCache = CACHE[networkName]

  if (type === 'ttl') {
    if (!netCache.TTL) netCache.TTL = new TLRUCache(null)
    return netCache.TTL
  }

  if (type === 'epoch' || type === 'block') {
    if (!netCache.EPOCH) netCache.EPOCH = new LRUCache(null, {maxsize: 20})
    const epochPos = EpochRefConf[method]
    if (epochPos === undefined)
      throw new Error(
        'Invalid cache option, no epoch/block ref pos in @cfxjs/rpc-epoch-ref',
      )
    let epoch = params[epochPos]

    // epoch is latest...
    if (!epoch.startsWith('0x')) {
      epoch = getCacheStore({networkName}, {type: 'ttl'}).get(`EPOCH${epoch}`)
      if (epoch) params[epochPos] = epoch
    }

    let store = netCache.EPOCH.get(epoch)
    if (!store) store = new TLRUCache()
    netCache.EPOCH.set(epoch, store)

    return store
  }
}

const getCacheKey = (key, req) => {
  const k = isFunction(key) ? key(req) : key
  if (isString(k)) return k
  if (isArray(k) || isObject(k)) return JSON.stringify(k)
  throw new Error(`Invalid cache key: ${k}`)
}

const getCache = ({req, conf}) => {
  if (!conf || !conf.type || !conf.key) return
  const {key} = conf

  const Cache = getCacheStore(req, conf)
  if (!Cache) return

  const k = getCacheKey(key, req)
  return Cache.get(k)
}

const setCache = ({req, res, conf}) => {
  if (!conf || !conf.type || !conf.key || !res || !res.result) return
  const {ttl, key} = conf

  const Cache = getCacheStore(req, conf)
  if (!Cache) return

  const k = getCacheKey(key, req)
  Cache.set(k, res.result, ttl)
}

export const init = () =>
  // config = {}
  {
    return {get: getCache, set: setCache}
  }
