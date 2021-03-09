export function isTestMode() {
  return import.meta.env.NODE_ENV === 'test'
}

export function isDevMode() {
  return import.meta.env.NODE_ENV === 'development'
}

export function isProdMode() {
  return import.meta.env.NODE_ENV === 'production'
}
