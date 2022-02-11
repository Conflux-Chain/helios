import {cat, ethHexAddress, base32UserAddress, or} from '@fluent-wallet/spec'
import addrByNet from '@fluent-wallet/addr-by-network'

export const NAME = 'wallet_getNextNonce'

export const schemas = {
  input: [or, [cat, base32UserAddress], [cat, ethHexAddress]],
}

export const permissions = {
  locked: true,
  methods: ['cfx_getNextNonce', 'eth_getTransactionCount'],
  external: ['popup', 'inpage'],
}

export const main = async ({
  rpcs: {eth_getTransactionCount, cfx_getNextNonce},
  params: [address],
  network: {netId, type},
}) => {
  address = addrByNet({address, networkType: type, networkId: netId})
  const getNextNonce =
    type === 'cfx' ? cfx_getNextNonce : eth_getTransactionCount
  const args = type === 'cfx' ? [address] : [address, 'pending']
  return await getNextNonce(args)
}
