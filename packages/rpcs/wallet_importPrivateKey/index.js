import {privateKey, map, password} from '@cfxjs/spec'

export const NAME = 'wallet_importPrivateKey'

export const permissions = {
  methods: ['wallet_addVault'],
}

export const schemas = {
  input: [
    map,
    {closed: true},
    ['privateKey', privateKey],
    ['password', password],
  ],
}

export const main = async ({params, rpcs: {wallet_addVault}}) =>
  await wallet_addVault(params)
