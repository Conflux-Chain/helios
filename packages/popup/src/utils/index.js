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

export const getRouteWithAuth = (hasAccount, isLocked) => {
  if (typeof hasAccount !== 'boolean' || typeof isLocked !== 'boolean') {
    return null
  }
  if (!hasAccount) {
    return '/welcome'
  }
  if (hasAccount && isLocked) {
    return '/unlock'
  }
  return null
}

export function shuffle(arr) {
  let arrAdd = [...arr]
  for (let i = 1; i < arrAdd.length; i++) {
    const random = Math.floor(Math.random() * (i + 1))
    ;[arrAdd[i], arrAdd[random]] = [arrAdd[random], arrAdd[i]]
  }
  return arrAdd
}
