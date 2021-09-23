import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_getCurrentNetwork'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup'],
  methods: [],
  db: ['getOneNetwork'],
}

export const main = ({db: {getOneNetwork}}) => {
  return getOneNetwork({selected: true})
}
