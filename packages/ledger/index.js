export {default as Conflux} from './conflux.js'
export {default as Ethereum} from './ethereum.js'
export * as consts from './const.js'

import {
  LEDGER_NANOS_PRODUCT_NAME,
  LEDGER_NANOX_PRODUCT_NAME,
  LEDGER_NANOS_NAME,
  LEDGER_NANOX_NAME,
} from './const.js'
export function handleName(productName) {
  // Before the version 2.6.0 of Fluent, we only support the NanoS and NanoX devices,so we hardcoded their names and renamed them to something more readable.
  // But Ledger often produces new products, so we changed the naming to a more generic way，such as:  'Nano S Plus' -> 'Nano-S-Plus'
  if (productName === LEDGER_NANOS_PRODUCT_NAME) return LEDGER_NANOS_NAME
  if (productName === LEDGER_NANOX_PRODUCT_NAME) return LEDGER_NANOX_NAME
  return productName ? productName.replaceAll(' ', '-') : ''
}
