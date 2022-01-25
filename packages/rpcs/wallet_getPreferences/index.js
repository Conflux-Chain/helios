import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_getPreferences'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup'],
  methods: [],
  db: ['getPreferences'],
}

export const main = ({db: {getPreferences}}) => {
  return getPreferences()
}
