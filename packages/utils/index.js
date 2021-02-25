/**
 * @fileOverview general utils for extension wallet
 * @name index.js
 */

export function isTestMode() {
  return process.env.NODE_ENV === 'test'
}

export function isDevMode() {
  return process.env.NODE_ENV === 'development'
}

export function isProdMode() {
  return process.env.NODE_ENV === 'production'
}
