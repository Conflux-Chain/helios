import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_getCurrentAccount'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup'],
  methods: [],
  db: ['getOneAccount'],
}

export const main = ({db: {getOneAccount}}) => {
  return getOneAccount({selected: true})
}
