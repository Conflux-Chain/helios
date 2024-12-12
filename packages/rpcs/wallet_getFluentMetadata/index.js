import {optParam} from '@fluent-wallet/spec'
import {PACKAGE_VERSION, VIEW_PACKAGE_VERSION} from '@fluent-wallet/inner-utils'

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
    // this version is only x.y.z
    version: PACKAGE_VERSION,
    // this version is include the version suffix e.g v1.0.0.rc-1
    view_version: VIEW_PACKAGE_VERSION,
  }
}
