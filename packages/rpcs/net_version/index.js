import {optParam} from '@fluent-wallet/spec'

export const NAME = 'net_version'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  db: ['getOneNetwork'],
  methods: ['cfx_netVersion'],
  locked: true,
}

export const cache = {
  type: 'ttl',
  ttl: 24 * 60 * 60 * 1000, // 1 day
  key: () => NAME,
}

export const main = ({
  f,
  params,
  db: {getOneNetwork},
  rpcs: {cfx_netVersion},
  _inpage,
  app,
  network: {type},
}) => {
  if (_inpage && app && type !== getOneNetwork({selected: true}).type) {
    return Number.MAX_SAFE_INTEGER
  }
  if (type === 'cfx') return cfx_netVersion()
  return f(params)
}
