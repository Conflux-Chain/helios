/**
 * @fileOverview rpc-engine
 * @name index.js
 */

export class RpcEngine {
  constructor(store, opts) {
    opts.forEach(rpc => {
      rpc.register(store)
    })
    this.store = store
  }

  request({method, params}) {
    return this.store[method](params)
  }
}
