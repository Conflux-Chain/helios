import {PASSWORD_REG_EXP} from '../constants'

const globalThis = window ?? global

export const request = (...args) => {
  const [method, params] = args
  const requestObj = {
    method,
  }
  if (params) {
    requestObj.params = params
  }
  return globalThis.___CFXJS_USE_RPC__PRIVIDER?.request(requestObj)
}

export function shuffle(arr) {
  let arrAdd = [...arr]
  for (let i = 1; i < arrAdd.length; i++) {
    const random = Math.floor(Math.random() * (i + 1))
    ;[arrAdd[i], arrAdd[random]] = [arrAdd[random], arrAdd[i]]
  }
  return arrAdd
}

export function validatePasswordReg(value) {
  return PASSWORD_REG_EXP.test(value)
}

export function getBatchIndex({groupIndex, accountIndex, accountGroups}) {
  if (groupIndex == 0) {
    return accountIndex
  }
  return accountGroups[groupIndex - 1].account.length + accountIndex
}
