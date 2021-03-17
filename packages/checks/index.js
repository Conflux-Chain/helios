/**
 * @fileOverview extends @thi.ng/checks
 * @name index.js
 */

export * from '@thi.ng/checks'
import {isFunction, isString} from '@thi.ng/checks'

export const isAsyncFunction = fn =>
  isFunction(fn) && fn.constructor.name === 'AsyncFunction'

export const isHexAddress = addr =>
  isString(addr) && /^0x[0-9a-fA-F]{40}$/.test(addr)
export const isHexAccountAddress = addr =>
  isString(addr) && /^0x1[0-9a-fA-F]{39}$/.test(addr)
export const isHexContractAddress = addr =>
  isString(addr) && /^0x8[0-9a-fA-F]{39}$/.test(addr)
