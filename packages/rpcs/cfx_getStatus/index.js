import {optParam} from '@fluent-wallet/spec'

export const NAME = 'cfx_getStatus'

export const schemas = {
  input: optParam,
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const chainIdCacheConf = {type: 'ttl', ttl: ONE_DAY_MS, key: 'cfx_chainId'}
const networkIdCacheConf = {type: 'ttl', ttl: ONE_DAY_MS, key: 'cfx_netVersion'}
export const cache = {
  type: 'ttl',
  key: () => `${NAME}`,
  afterSet(setCache, req, res) {
    setCache({req, res: {result: res.result.chainId}, conf: chainIdCacheConf})
    setCache({
      req,
      res: {result: parseInt(res.result.networkId, 16).toString(10)},
      conf: networkIdCacheConf,
    })
  },
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = async ({f}) => {
  return await f()
}
