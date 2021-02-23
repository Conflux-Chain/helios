/**
 * @fileOverview utilities
 * @name utils.js
 */

export function isTestMode() {
  return import.meta.env.MODE === 'test'
}

export function isDevMode() {
  return import.meta.env.MODE === 'development'
}

export function isProdMode() {
  return import.meta.env.MODE === 'production'
}
