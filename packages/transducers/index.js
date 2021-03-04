/**
 * @fileOverview wrap @thi.ng/transducers to add more xforms for promise
 * @name index.js
 */

import {map, sideEffect} from '@thi.ng/transducers'
export * from '@thi.ng/transducers'

const mapcatPFn = fn => arg =>
  !(arg instanceof Promise) ? fn(arg) : arg.then(fn)

export const mapP = (fn, src) => map(mapcatPFn(fn), src)

export const sideEffectP = fn => sideEffect(mapcatPFn(fn))
