export function getDefaultOptions() {
  return {
    dsn: import.meta.SNOWPACK_PUBLIC_SENTRY_DSN,
    environment: import.meta.SNOWPACK_PUBLIC_FLUENT_ENV || import.meta.NODE_ENV,
    release: import.meta.SNOWPACK_PUBLIC_FLUENT_VERSION,
  }
}
