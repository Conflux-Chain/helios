import browser from 'webextension-polyfill'
import {rpcStream} from '@cfxjs/extension-runtime/rpc-stream.js'
import {initProvider} from '@cfxjs/provider-api'

const globalThis = window ?? global
// globalThis.___CFXJS_USE_RPC__PRIVIDER = null

const RUNTIME_NAME = 'popup'

function onDisconnect() {
  globalThis.___CFXJS_USE_RPC__PRIVIDER = null
}

export const setupExtProvider = ({name = RUNTIME_NAME} = {}) => {
  if (globalThis.___CFXJS_USE_RPC__PRIVIDER)
    return globalThis.___CFXJS_USE_RPC__PRIVIDER
  const port = browser.runtime.connect({name})
  port.onDisconnect.removeListener(onDisconnect)
  port.onDisconnect.addListener(onDisconnect)
  const {send, stream} = rpcStream(port)
  globalThis.___CFXJS_USE_RPC__PRIVIDER = initProvider(stream, send)
  return globalThis.___CFXJS_USE_RPC__PRIVIDER
}
