/**
 * @fileOverview extends @thi.ng/checks
 * @name index.js
 */

export * from '@thi.ng/checks'
import {isFunction} from '@thi.ng/checks'

const AsyncFunction = (async () => {}).constructor

// this can't detect a normal function that returns a promise
export const isAsyncFunction = fn =>
  isFunction(fn) && fn instanceof AsyncFunction
