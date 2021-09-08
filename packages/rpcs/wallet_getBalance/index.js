import {or, cat, base32UserAddress, ethHexAddress} from '@fluent-wallet/spec'
import addrByNet from '@fluent-wallet/addr-by-network'

export const NAME = 'wallet_getBalance'

export const schemas = {
  input: [or, [cat, ethHexAddress], [cat, base32UserAddress]],
}

export const permissions = {
  locked: true,
  methods: ['cfx_getBalance', 'eth_getBalance'],
  external: ['popup', 'inpage'],
}

export const main = async ({
  rpcs: {cfx_getBalance, eth_getBalance},
  params: [address],
  network: {type, netId},
}) => {
  address = addrByNet({
    address,
    networkType: type,
    networkId: netId,
    addressType: 'user',
  })

  const getBalance = type === 'cfx' ? cfx_getBalance : eth_getBalance

  return await getBalance([address])
}
