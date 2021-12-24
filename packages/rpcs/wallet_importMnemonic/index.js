import {
  mnemonic,
  map,
  password,
  truep,
  maybe,
  nickname,
} from '@fluent-wallet/spec'

export const NAME = 'wallet_importMnemonic'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['nickname', {optional: true}, nickname],
    ['mnemonic', mnemonic],
    ['password', {optional: true}, password],
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
  methods: ['wallet_addVault'],
  external: ['popup'],
}

export const main = ({params, rpcs: {wallet_addVault}}) =>
  wallet_addVault(params)
