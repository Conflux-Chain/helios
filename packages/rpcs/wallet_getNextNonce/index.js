import {cat, ethHexAddress, base32UserAddress, or} from '@cfxjs/spec'
import addrByNet from '@cfxjs/addr-by-network'

export const NAME = 'wallet_getNextNonce'

export const schemas = {
  input: [or, [cat, base32UserAddress], [cat, ethHexAddress]],
}

export const permissions = {
  locked: true,
  methods: ['cfx_getNextNonce', 'eth_getTransactionCount'],
}

export const main = async ({
  rpcs: {eth_getTransactionCount, cfx_getNextNonce},
  params: [address],
  network: {netId, type},
}) => {
  address = addrByNet({address, networkType: type, networkId: netId})
  const getNextNonce =
    type === 'cfx' ? cfx_getNextNonce : eth_getTransactionCount
  return await getNextNonce([address])
}
