import {setupInpageProvider} from './setup-inpage-provider.js'
import {setupExtProvider} from './setup-ext-provider.js'

const globalThis = window ?? global

const INPAGE_PROTOCOL = ['http:', 'https:', 'file:']

export async function setupProvider() {
  if (
    !globalThis ||
    !globalThis.location || // nodejs
    INPAGE_PROTOCOL.includes(globalThis.location.protocol) // inpage
  )
    return setupInpageProvider()

  if (globalThis.___CFXJS_USE_RPC__PRIVIDER)
    return globalThis.___CFXJS_USE_RPC__PRIVIDER
  return setupExtProvider()
}
