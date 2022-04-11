import {optParam} from '@fluent-wallet/spec'

export const NAME = 'cfx_chainId'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  db: ['getOneNetwork'],
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

export const main = async ({
  f,
  db: {getOneNetwork},
  rpcs: {cfx_getStatus},
  _inpage,
  app,
}) => {
  if (
    _inpage &&
    ((app && app.currentNetwork.type === 'cfx') ||
      getOneNetwork({selected: true}).type === 'cfx')
  ) {
    return '0x' + Number.MAX_SAFE_INTEGER.toString(16)
  }

  const rst = await f()
  if (!rst?.result || rst.result === 'nocache')
    return (await cfx_getStatus())?.chainId
  return rst.result
}
