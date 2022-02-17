import ConfluxJS from 'js-conflux-sdk'
import SafeEventEmitter from '@fluent-wallet/safe-event-emiter'
import {protectDeprecatedEvent, deprecated, requestFactory} from './utils.js'

// DEPRECATED
class PortalProvider extends SafeEventEmitter {
  #s
  #send
  #isConnected
  isFluent = true
  isConfluxPortal = true

  // DEPRECATED
  #_chainId
  #_networkVersion
  #_selectedAddress = null
  constructor(stream, send) {
    super({
      allowedEventType: [
        // DEPRECATED
        'networkChanged',
        'chainIdChanged',

        'connect',
        'disconnect',
        'accountsChanged',
        'chainChanged',
        'message',
      ],
      streamCacheLast: true,
    })
    this.#s = stream
    this.#send = send
    this.#s.subscribe({next: this.#streamEventListener.bind(this)})

    // DEPRECATED
    this.confluxJS = new ConfluxJS.Conflux()

    this.confluxJS.provider = this

    this.on('connect', () => {
      this.#isConnected = true

      // DEPRECATED
      {
        this.request({method: 'cfx_chainId'}).then(result => {
          this.#_chainId = result
          const networkId = parseInt(result, 16)
          this.#_networkVersion = networkId.toString(10)
          this.confluxJS.networkId = networkId
          this.confluxJS.wallet.networkId = networkId
          this.emit('chainChanged', result)
          this.emit('networkChanged', networkId)
        })
        this.request({method: 'cfx_accounts'})
          .then(result => {
            if (!result) this.#_selectedAddress = null
            else this.#_selectedAddress = result[0]
            this.emit('accountsChanged', result)
          })
          .catch(() => (this.#_selectedAddress = null))
        this.on('chainChanged', chainId => {
          this.#_chainId = chainId
          const networkId = parseInt(chainId, 16)
          this.#_networkVersion = networkId.toString(10)
          this.confluxJS.networkId = networkId
          this.confluxJS.wallet.networkId = networkId
        })
        this.on('accountsChanged', accounts => {
          this.#_selectedAddress = accounts[0]
        })
      }
    })
  }

  // DEPRECATED
  close() {}

  // DEPRECATED
  call(method, ...params) {
    params = params.reduce((acc, p) => {
      if (p === undefined) return acc
      return acc.concat([p])
    }, [])
    return this.request({method, params})
  }

  // DEPRECATED
  get chainId() {
    deprecated(
      'PROPERTY',
      '"conflux.chainId" is deprecated, please use "conflux.request({method: "cfx_chainId"})" instead',
    )
    return this.#_chainId
  }

  // DEPRECATED
  get networkVersion() {
    deprecated(
      'PROPERTY',
      '"conflux.networkVersion" is deprecated, please use "conflux.request({method: "cfx_netVersion"})" instead',
    )
    return this.#_networkVersion
  }

  // DEPRECATED
  get selectedAddress() {
    deprecated(
      'PROPERTY',
      '"conflux.networkVersion" is deprecated, please use "conflux.request({method: "cfx_netVersion"})" instead',
    )
    return this.#_selectedAddress || null
  }

  request(req) {
    return requestFactory(this.#send, req).then(res => {
      if (res.error) throw res.error
      return res.result
    })
  }

  // DEPRECATED
  on(eventType, listener) {
    eventType = protectDeprecatedEvent(eventType)
    return SafeEventEmitter.prototype.on.call(this, eventType, listener)
  }

  // DEPRECATED
  off(eventType, listener) {
    eventType = protectDeprecatedEvent(eventType)
    return SafeEventEmitter.prototype.off.call(this, eventType, listener)
  }

  // DEPRECATED
  enable() {
    deprecated(
      'METHOD',
      '"conflux.enable" is deprecated, please use "conflux.request({method: "cfx_requestAccounts"})" instead',
    )
    return this.request({method: 'cfx_requestAccounts'})
  }

  // DEPRECATED
  sendAsync(payload, callback) {
    deprecated(
      'METHOD',
      '"conflux.sendAsync" is deprecated, please use "conflux.request" instead',
    )
    if (typeof callback !== 'function')
      throw new Error('Invalid callback, not a function')
    requestFactory(this.#send, payload).then(res => {
      if (res.error) callback(res.error)
      return callback(null, res.result)
    })
  }

  // DEPRECATED
  send(...args) {
    deprecated(
      'METHOD',
      '"conflux.send" is deprecated, please use "conflux.request" instead',
    )
    const [a1, a2] = args
    if (typeof a2 === 'function') return this.sendAsync(a1, a2)
    if (typeof a1 === 'string') return this.request({method: a1, params: a2})

    if (!a2 && typeof a1 === 'object') {
      if (a1.method === 'cfx_accounts') {
        if (this.selectedAddress) return Promise.resolve([this.selectedAddress])
        else return Promise.resolve([])
      }
      if (a1.method === 'cfx_netVersion' || a1.method === 'net_version') {
        return Promise.resolve(this.networkVersion)
      }
    }
  }

  #streamEventListener(msg = {}) {
    const {event, params, id} = msg
    if (id !== undefined) return
    if (!event) return
    this.emit(event, params)
    // DEPRECATED
    {
      // https://docs.metamask.io/guide/ethereum-provider.html#legacy-events
      if (event === 'chainChanged') {
        this.emit('networkChanged', parseInt(params, 16).toString(10))
      }
      if (event === 'chainChanged') {
        this.emit('chainIdChanged', params)
      }
    }
  }

  isConnected() {
    return this.#isConnected
  }
}

export default PortalProvider
