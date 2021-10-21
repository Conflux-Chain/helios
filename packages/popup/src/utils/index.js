import {PASSWORD_REG_EXP} from '../constants'
import {stripHexPrefix, isHexPrefixed} from '@fluent-wallet/utils'
import {fromDripToCfx} from '@fluent-wallet/data-format'
import BN from 'bn.js'

const globalThis = window ?? global

export function request(...args) {
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

export function formatHexBalance(balance) {
  if (typeof balance !== 'string' || !isHexPrefixed(balance)) {
    return '--'
  }
  return fromDripToCfx(new BN(stripHexPrefix(balance), 16).toString())
}

export function removeAllChild(dom) {
  let child = dom.lastElementChild
  while (child) {
    dom.removeChild(child)
    child = dom.lastElementChild
  }
}
export function jsNumberForAddress(address) {
  if (!address) {
    return address
  }
  const addr = address.slice(2, 10)
  const seed = parseInt(addr, 16)
  return seed
}
