const globalThis = window ?? global

export const request = (...args) => {
  return globalThis.___CFXJS_USE_RPC__PRIVIDER?.request(...args)
}
