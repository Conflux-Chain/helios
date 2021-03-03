/**
 * @fileOverview csp for helios
 * @name index.js
 */

import {Channel} from '@thi.ng/csp'

export function chan() {
  return new Channel(...arguments)
}
