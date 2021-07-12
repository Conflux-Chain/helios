import {nul} from '@cfxjs/spec'

export const NAME = 'cfx_getStatus'

export const schemas = {
  input: [nul],
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const chainIdCacheConf = {type: 'ttl', ttl: ONE_DAY_MS, key: 'cfx_chainId'}
const networkIdCacheConf = {type: 'ttl', ttl: ONE_DAY_MS, key: 'cfx_netVersion'}
export const cache = {
  type: 'ttl',
  ttl: 500,
  key: () => `${NAME}`,
  afterSet(setCache, req, res) {
    setCache({req, res: {result: res.result.chainId}, chainIdCacheConf})
    setCache({req, res: {result: res.result.networkId}, networkIdCacheConf})
  },
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = async ({f}) => {
  return await f()
}
