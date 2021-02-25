/**
 * @fileOverview rpc-engine
 * @name index.js
 */

export class RpcEngine {
  constructor(store, opts) {
    const {setState} = store
    opts.forEach(rpc => {
      setState({[rpc.NAME]: rpc.main(store)})
    })
    this.store = store
  }

  request({method, params}) {
    return this.store.getState()[method](params)
  }
}
