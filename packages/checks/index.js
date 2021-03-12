/**
 * @fileOverview extends @thi.ng/checks
 * @name index.js
 */

export * from '@thi.ng/checks'
import {isFunction} from '@thi.ng/checks'

export const isAsyncFunction = fn =>
  isFunction(fn) && fn.constructor.name === 'AsyncFunction'
