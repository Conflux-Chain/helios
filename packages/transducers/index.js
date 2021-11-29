/**
 * @fileOverview wrap @thi.ng/transducers to add more xforms for promise
 * @name index.js
 */

import {map, keep, comp, sideEffect} from '@thi.ng/transducers'

export * from '@thi.ng/transducers'

export const check = f => map(a => (f(a), a))
export const keepTruthy = fn =>
  comp(
    sideEffect(x => {
      if (!x && typeof fn === 'function') fn()
    }),
    keep(x => x || null),
  )
