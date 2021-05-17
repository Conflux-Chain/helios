/**
 * @fileOverview wrap @thi.ng/transducers to add more xforms for promise
 * @name index.js
 */

import {map} from '@thi.ng/transducers'

export * from '@thi.ng/transducers'

export const check = f => map(a => (f(a), a))
