import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_getFluentMetadata'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  methods: [],
  db: [],
}

export const main = () => {
  return {version: import.meta.env.SNOWPACK_PUBLIC_FLUENT_VERSION}
}
