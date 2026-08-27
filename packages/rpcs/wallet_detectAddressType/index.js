import {map, or, base32Address, ethHexAddress} from '@fluent-wallet/spec'
import {
  detectCfxAddressType,
  detectEthAddressType,
} from '@fluent-wallet/detect-address-type'

export const NAME = 'wallet_detectAddressType'

export const schemas = {
  input: [map, {closed: true}, ['address', [or, base32Address, ethHexAddress]]],
}
export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  methods: ['eth_getCode'],
}

export const main = async ({
  rpcs: {eth_getCode},
  params: {address},
  network: {type},
}) => {
  if (type === 'cfx') {
    return await detectCfxAddressType(address)
  }

  if (type === 'eth') {
    return await detectEthAddressType(address, {
      request({params}) {
        return eth_getCode({errorFallThrough: true}, params)
      },
    })
  }
}
