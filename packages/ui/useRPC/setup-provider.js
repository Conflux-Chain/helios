import {setupInpageProvider} from './setup-inpage-provider.js'

const globalThis = window ?? global

const INPAGE_PROTOCOL = ['http:', 'https:', 'file:']

export function setupProvider() {
  if (
    !globalThis ||
    !globalThis.location || // nodejs
    INPAGE_PROTOCOL.includes(globalThis.location.protocol) // inpage
  )
    return setupInpageProvider()

  return import('./setup-ext-provider.js').then(m => m.setupExtProvider())
}
