import {mnemonic, map, password, truep} from '@cfxjs/spec'

export const NAME = 'wallet_importMnemonic'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['mnemonic', mnemonic],
    ['password', password],
    [
      'cfxOnly',
      {
        optional: true,
        doc: 'only derive conflux compatible address from this mnemonic',
      },
      truep,
    ],
    [
      'force',
      {optional: true, doc: 'set to true to skip duplication check'},
      truep,
    ],
  ],
}

export const permissions = {
  methods: ['wallet_addVault'],
  external: ['popup'],
}

export const main = async ({params, rpcs: {wallet_addVault}}) =>
  await wallet_addVault(params)
