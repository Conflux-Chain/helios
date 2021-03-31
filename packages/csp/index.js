/**
 * @fileOverview csp for helios
 * @name index.js
 */

import {Channel} from '@thi.ng/csp'
import {isFunction} from '@cfxjs/checks'

export * from '@thi.ng/csp'

export function chan() {
  return new Channel(...arguments)
}

export const fromPromise = Channel.fromPromise

export const applyTransducer = (c, tx, onerror) => {
  c.tx = tx(Channel.RFN)
  if (isFunction(onerror)) c.onerror = onerror

  return c
}
