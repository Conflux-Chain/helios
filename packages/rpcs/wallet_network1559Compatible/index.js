import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_network1559Compatible'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  methods: ['eth_getBlockByNumber'],
  db: [],
}

export const cache = {
  type: 'ttl',
  ttl: 24 * 60 * 60 * 1000, // cache for 1 day
  key: ({network}) => `${NAME}${network.endpoint}`,
}

export const main = async ({rpcs: {eth_getBlockByNumber}, network}) => {
  if (network.type === 'cfx') return false
  const block = await eth_getBlockByNumber(['latest', false])
  if (block && block.baseFeePerGas) return true
  return false
}
