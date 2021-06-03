import {map, password, or, ethHexAddress, base32UserAddress} from '@cfxjs/spec'

export const NAME = 'wallet_importAddress'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['password', password],
    ['address', [or, ethHexAddress, base32UserAddress]],
  ],
}

export const permissions = {
  methods: ['wallet_addVault'],
}

export const main = async ({
  params: {password, address},
  rpcs: {wallet_addVault},
}) => await wallet_addVault({password, address: address.toLowerCase()})
