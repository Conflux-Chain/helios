import {mnemonic, map, password} from '@cfxjs/spec'

export const NAME = 'wallet_importMnemonic'

export const permissions = {
  methods: ['wallet_addVault'],
}

export const schema = {
  input: [map, {closed: true}, ['mnemonic', mnemonic], ['password', password]],
}

export const main = async ({params, rpcs: {wallet_addVault}}) =>
  await wallet_addVault(params)
