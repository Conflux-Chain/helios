/**
 * @fileOverview rpc-engine
 * @name index.js
 */
import {Channel} from '@thi.ng/csp'

/**
 * manage and handle response of rpc request
 */
export class RpcEngine {
  /**
   * RpcEngine constructor
   * @param {object} store a state store compatible with zustand store
   * @param {object} opts rpc engine options
   * @param {array} opts.method rpc methods used to initialize the engine
   */
  constructor(store, opts = {methods: []}) {
    const {methods} = opts
    // store rpc methods
    this.store = new Set()

    // rpc request channel
    this.chan = new Channel('rpc channel')

    // register rpc methods
    methods.forEach(rpc => {
      this.store[rpc.NAME] = rpc.main
    })

    // wallet store
    this.parentStore = store

    // start listen for rpc request
    this.start()
  }

  /**
   * send a rpc request to rpc engine
   * @param {string} method rpc method name
   * @param {array|string|object} params rpc request params
   * @returns {Promise} Promise resolves to rpc response or rpc error, won't reject
   */
  request({method, params}) {
    const c = new Channel(1)
    const _rpcStack = [method]
    this.chan.write({
      method,
      req: {
        _rpcStack,
        params,
        ...this.parentStore,
        rpcs: new Proxy(this.store, {
          get() {
            _rpcStack.push(arguments[1])
            return Reflect.get(...arguments)
          },
        }),
      },
      c,
    })
    return c.read()
  }

  /**
   * start listening for rpc requests
   * @private
   */
  async #start() {
    while (true) {
      const {method, req, c} = await this.chan.read()
      // TODO: move rpc result handler elsewhere
      this.store[method](req)
        .then(rst => {
          const result = {jsonrpc: '2.0', id: 1}
          result.result = rst || '0x1'
          c.write.call(c, result)
        })
        .catch(err => {
          // TODO: move rpc error handler elsewhere
          err.message =
            'RPC Stack: \n-> ' +
            req._rpcStack.join('\n-> ') +
            '\n' +
            err.message
          console.error(err)
          const result = {
            jsonrpc: '2.0',
            error: {code: -32603, message: err.message, data: err},
            id: 2,
          }
          c.write.call(c, result)
        })
    }
  }
}
