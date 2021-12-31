const globalThis = window ?? global
// globalThis.___CFXJS_USE_RPC__PRIVIDER = null

export function setupInpageProvider() {
  if (globalThis.fluent)
    globalThis.___CFXJS_USE_RPC__PRIVIDER = globalThis.fluent
  return globalThis.___CFXJS_USE_RPC__PRIVIDER
}
