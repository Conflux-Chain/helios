import {
  map,
  password,
  or,
  hexUserAddress,
  base32AccountMainnetAddress,
  base32AccountTestnetAddress,
} from '@cfxjs/spec'

export const NAME = 'wallet_importAddress'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['password', password],
    [
      'address',
      [
        or,
        hexUserAddress,
        base32AccountMainnetAddress,
        base32AccountTestnetAddress,
      ],
    ],
  ],
}

export const permissions = {
  methods: ['wallet_addVault'],
}

export const main = async ({params, rpcs: {wallet_addVault}}) =>
  await wallet_addVault(params)
