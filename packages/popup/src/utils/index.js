export const getAuth = (hasAccount, isLocked) => {
  if (typeof hasAccount !== 'boolean' || typeof isLocked !== 'boolean') {
    return null
  }
  if (hasAccount && isLocked) {
    return '/unlock'
  }

  if (!hasAccount) {
    return '/welcome'
  }
  return null
}

const globalThis = window ?? global

export const request = (...args) => {
  return globalThis.___CFXJS_USE_RPC__PRIVIDER?.request(...args)
}
