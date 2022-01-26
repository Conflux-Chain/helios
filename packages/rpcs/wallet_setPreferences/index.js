import {map, boolean} from '@fluent-wallet/spec'

export const NAME = 'wallet_setPreferences'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['hideTestNetwork', {optional: true}, boolean],
    ['useMordenProviderAPI', {optional: true}, boolean],
  ],
}

export const permissions = {
  external: ['popup'],
  methods: [],
  db: ['setPreferences'],
}

export const main = ({db: {setPreferences}, params}) => {
  return setPreferences(params)
}
