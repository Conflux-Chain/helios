import {privateKey, map, password, nickname} from '@fluent-wallet/spec'

export const NAME = 'wallet_importPrivateKey'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['nickname', {optional: true}, nickname],
    ['privateKey', privateKey],
    ['password', {optional: true}, password],
  ],
}

export const permissions = {
  methods: ['wallet_addVault'],
  external: ['popup'],
}

export const main = async ({params, rpcs: {wallet_addVault}}) =>
  await wallet_addVault(params)
