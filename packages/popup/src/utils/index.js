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

export function formatIntoShortAddress(address) {
  if (typeof address !== 'string' || address.length <= 11) {
    return address
  }
  return `${address.substr(0, 7)}...${address.substring(address.length - 4)}`
}
