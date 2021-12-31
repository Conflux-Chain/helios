import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_getPendingAuthRequest'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup'],
  methods: [],
  db: ['getPendingAuthReq'],
}

export const main = ({db: {getPendingAuthReq}}) => {
  return getPendingAuthReq()
}
