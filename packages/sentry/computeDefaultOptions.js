export function getDefaultOptions() {
  return {
    dsn: import.meta.env.SNOWPACK_PUBLIC_SENTRY_DSN,
    environment:
      import.meta.env.SNOWPACK_PUBLIC_FLUENT_ENV || import.meta.env.NODE_ENV,
    release: import.meta.env.SNOWPACK_PUBLIC_FLUENT_VERSION,
  }
}
