import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_chainId'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  methods: ['cfx_chainId', 'eth_chainId'],
  db: [],
}

export const main = ({rpcs: {cfx_chainId, eth_chainId}, network: {type}}) => {
  if (type === 'cfx') {
    return cfx_chainId()
  } else {
    return eth_chainId([])
  }
}
