import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_network1559Compatible'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  methods: ['eth_getBlockByNumber', 'cfx_getBlockByEpochNumber'],
  db: [],
}

export const cache = {
  type: 'ttl',
  ttl: 24 * 60 * 60 * 1000, // cache for 1 day
  key: ({network}) => `${NAME}${network.endpoint}`,
}

export const main = async ({
  rpcs: {eth_getBlockByNumber, cfx_getBlockByEpochNumber},
  network,
}) => {
  if (network.type === 'cfx') {
    const block = await cfx_getBlockByEpochNumber(['latest_state', false])
    return block && block.baseFeePerGas
  }
  const block = await eth_getBlockByNumber(['latest', false])
  if (block && block.baseFeePerGas) return true
  return false
}
