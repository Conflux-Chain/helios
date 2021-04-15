'use strict'

const JSDOMEnvironment = require('jest-environment-jsdom')

class HeliosJSDOMEnvironment extends JSDOMEnvironment {
  constructor(config) {
    super(
      Object.assign({}, config, {
        globals: Object.assign({}, config.globals, {
          Uint32Array: Uint32Array,
          Uint8Array: Uint8Array,
          ArrayBuffer: ArrayBuffer,
        }),
      }),
    )
  }
}

module.exports = HeliosJSDOMEnvironment
