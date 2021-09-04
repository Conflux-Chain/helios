const globalThis = window ?? global

export const request = (...args) => {
  const [method, params] = args
  const providerParams = {
    method,
  }
  if (params) {
    providerParams['params'] = params
  }
  return globalThis.___CFXJS_USE_RPC__PRIVIDER?.request(providerParams)
}

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
