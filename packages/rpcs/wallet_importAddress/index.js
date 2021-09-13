import {
  map,
  password,
  or,
  ethHexAddress,
  base32UserAddress,
  nickname,
} from '@fluent-wallet/spec'

export const NAME = 'wallet_importAddress'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['nickname', {optional: true}, nickname],
    ['password', {optional: true}, password],
    ['address', [or, ethHexAddress, base32UserAddress]],
  ],
}

export const permissions = {
  methods: ['wallet_addVault'],
  external: ['popup'],
}

export const main = async ({
  params: {password, address, nickname},
  rpcs: {wallet_addVault},
}) => {
  if (nickname)
    return await wallet_addVault({
      password,
      address: address.toLowerCase(),
      nickname,
    })
  else
    return await wallet_addVault({
      password,
      address: address.toLowerCase(),
    })
}
