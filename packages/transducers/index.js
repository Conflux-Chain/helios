/**
 * @fileOverview wrap @thi.ng/transducers to add more xforms for promise
 * @name index.js
 */

import {
  map,
  keep,
  comp,
  sideEffect,
  pluck,
  multiplexObj,
} from '@thi.ng/transducers'

export * from '@thi.ng/transducers'

export const check = f =>
  map(a => {
    return f(a), a
  })
export const keepTruthy = fn =>
  comp(
    sideEffect(x => {
      if (!x && typeof fn === 'function') fn()
    }),
    keep(x => x || null),
  )

/**
 * like multiplexObj but only branches with truthy value get executed and only
 * branches with truthy result get remained
 * @param {any} obj -
 * @returns {any} -
 */
export function branchObj(obj) {
  const multiplexObjTx = Object.entries(obj).reduce((acc, [k, vs]) => {
    vs = Array.isArray(vs) ? vs : [vs]
    acc[k] = comp(pluck(k), keepTruthy(), ...vs)
    return acc
  }, {})
  return comp(
    multiplexObj(multiplexObjTx),
    map(d => {
      return Object.entries(d).reduce((acc, [k, v]) => {
        if (v) acc[k] = v
        return acc
      }, {})
    }),
  )
}
