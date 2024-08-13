import {PACKAGE_VERSION} from '@fluent-wallet/inner-utils'

export function getDefaultOptions() {
  return {
    dsn: import.meta.env
      ? import.meta.env.SNOWPACK_PUBLIC_SENTRY_DSN
      : process.env.SENTRY_DSN,
    environment: import.meta.env
      ? import.meta.env.SNOWPACK_PUBLIC_FLUENT_ENV
      : process.env.NODE_ENV,
    release: PACKAGE_VERSION,
  }
}
