import {cat, or, base32UserAddress, ethHexAddress} from '@fluent-wallet/spec'

export const NAME = 'wallet_getNextUsableNonce'

export const schemas = {
  input: [cat, [or, base32UserAddress, ethHexAddress]],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  methods: ['cfx_getNextUsableNonce', 'eth_getTransactionCount'],
  db: [],
}

export const main = ({
  rpcs: {cfx_getNextUsableNonce, eth_getTransactionCount},
  params: [address],
  network,
}) => {
  if (network.type === 'cfx') return cfx_getNextUsableNonce([address])
  else return eth_getTransactionCount([address, 'pending'])
}
