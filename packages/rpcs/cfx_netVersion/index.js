import {optParam} from '@fluent-wallet/spec'

export const NAME = 'cfx_netVersion'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  methods: ['cfx_getStatus'],
}

export const cache = {
  type: 'ttl',
  ttl: 24 * 60 * 60 * 1000,
  key: () => NAME,
  afterGet(_, c) {
    return c ?? 'nocache'
  },
}

export const main = async ({f, rpcs: {cfx_getStatus}}) => {
  const rst = await f()
  if (!rst?.result || rst?.result === 'nocache')
    return parseInt((await cfx_getStatus())?.networkId, 16).toString()
  else return rst.result
}
