import {TLRUCache} from '@thi.ng/cache'

const TTL_CACHE = new TLRUCache(null)

const getCacheStore = ({type}) => {
  if (type === 'ttl') {
    return TTL_CACHE
  }
}

const getCache = ({k, conf: {type, ttl}}) => {
  const Cache = getCacheStore({type, ttl})
  return Cache.get(k)
}

const setCache = ({k, v, conf: {type, ttl}}) => {
  const Cache = getCacheStore({type, ttl})
  Cache.set(k, v, ttl)
}

export const init = () =>
  // config = {}
  {
    return {get: getCache, set: setCache}
  }
