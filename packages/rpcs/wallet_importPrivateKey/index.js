import {privateKey, map, password, nickname} from '@cfxjs/spec'

export const NAME = 'wallet_importPrivateKey'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['nickname', {optional: true}, nickname],
    ['privateKey', privateKey],
    ['password', password],
  ],
}

export const permissions = {
  locked: true,
  methods: ['wallet_addVault'],
  external: ['popup'],
}

export const main = async ({params, rpcs: {wallet_addVault}}) =>
  await wallet_addVault(params)
