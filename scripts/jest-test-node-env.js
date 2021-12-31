'use strict'

const NodeEnvironment = require('jest-environment-node')

class HeliosNodeEnvironment extends NodeEnvironment {
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

module.exports = HeliosNodeEnvironment
