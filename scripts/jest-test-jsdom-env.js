const {webcrypto} = require('node:crypto')

// eslint-disable-next-line no-undef
Object.defineProperty(globalThis, 'crypto', {
  value: webcrypto,
})
