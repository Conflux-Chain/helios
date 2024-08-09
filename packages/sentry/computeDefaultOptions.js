import {PACKAGE_VERSION} from '@fluent-wallet/inner-utils'

export function getDefaultOptions() {
  return {
    dsn: import.meta.env.SNOWPACK_PUBLIC_SENTRY_DSN,
    environment:
      import.meta.env.SNOWPACK_PUBLIC_FLUENT_ENV || import.meta.env.NODE_ENV,
    release: PACKAGE_VERSION,
  }
}
