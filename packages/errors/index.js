/**
 * @fileOverview extends @thi.ng/errors
 * @name index.js
 */

export * from '@thi.ng/errors'

export const defRpcError = (
  prefix,
  suffix = msg => (msg !== undefined ? ': ' + msg : ''),
) =>
  class extends Error {
    constructor(msg, rpcData) {
      super(prefix(msg) + suffix(msg))
      this.rpcData = rpcData
    }
  }
