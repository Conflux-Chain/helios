import {optParam} from '@fluent-wallet/spec'

export const NAME = 'net_version'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  methods: ['cfx_netVersion'],
  locked: true,
}

export const cache = {
  type: 'ttl',
  ttl: 24 * 60 * 60 * 1000,
  key: () => NAME,
}

export const main = ({f, params, rpcs: {cfx_netVersion}, network: {type}}) => {
  if (type === 'cfx') return cfx_netVersion()
  return f(params)
}
