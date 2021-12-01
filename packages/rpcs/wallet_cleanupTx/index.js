import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_cleanupTx'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: [],
  locked: true,
  methods: [],
  db: ['cleanupTx'],
}

export const main = ({db: {cleanupTx}}) => {
  cleanupTx()
}
