import {optParam} from '@fluent-wallet/spec'
import {PACKAGE_VERSION} from '@fluent-wallet/inner-utils'

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
  return {
    version: PACKAGE_VERSION,
  }
}
