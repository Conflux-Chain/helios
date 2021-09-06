import {mnemonic, map, password, truep, maybe, nickname} from '@cfxjs/spec'

export const NAME = 'wallet_importMnemonic'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['nickname', {optional: true}, nickname],
    ['mnemonic', mnemonic],
    ['password', password],
    ['waitTillFinish', {optional: true}, [maybe, truep]],
    [
      'cfxOnly',
      {
        optional: true,
        doc: 'only derive conflux compatible address from this mnemonic',
      },
      [maybe, truep],
    ],
    [
      'force',
      {optional: true, doc: 'set to true to skip duplication check'},
      [maybe, truep],
    ],
  ],
}

export const permissions = {
  locked: true,
  methods: ['wallet_addVault'],
  external: ['popup'],
}

export const main = async ({params, rpcs: {wallet_addVault}}) =>
  await wallet_addVault(params)
