import {or, cat, base32Address, ethHexAddress} from '@cfxjs/spec'
import addrByNet from '@cfxjs/addr-by-network'

export const NAME = 'wallet_getBalance'

export const schemas = {
  input: [or, [cat, ethHexAddress], [cat, base32Address]],
}

export const permissions = {methods: ['cfx_getBalance', 'eth_getBalance']}

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
