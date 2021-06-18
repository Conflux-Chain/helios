import browser from 'webextension-polyfill'
import {rpcStream} from '@cfxjs/extension-runtime/rpc-stream.js'
import {initProvider} from '@cfxjs/provider-api'

const globalThis = window ?? global
// globalThis.___CFXJS_USE_RPC__PRIVIDER = null

const RUNTIME_NAME = 'popup'

export const setupExtProvider = ({name = RUNTIME_NAME} = {}) => {
  if (globalThis.___CFXJS_USE_RPC__PRIVIDER) return
  const port = browser.runtime.connect({name})
  port.onDisconnect.addListener(
    () => (globalThis.___CFXJS_USE_RPC__PRIVIDER = null),
  )
  globalThis.___CFXJS_USE_RPC__PRIVIDER = initProvider(rpcStream(port))
  return globalThis.___CFXJS_USE_RPC__PRIVIDER
}
