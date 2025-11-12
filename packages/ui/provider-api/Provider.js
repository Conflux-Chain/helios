import SafeEventEmitter from '@fluent-wallet/safe-event-emiter'
import {protectDeprecatedEvent, deprecated, requestFactory} from './utils.js'

class Provider extends SafeEventEmitter {
  #s
  #send
  #isConnected
  isFluent = true
  isMetaMask = true

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
        'data',

        'connect',
        'disconnect',
        'accountsChanged',
        'chainChanged',
        'message',

        // temp for usdt0 page
        'change',
      ],
      streamCacheLast: false,
    })
    this.#s = stream
    this.#send = send
    this.#s.subscribe({next: this.#streamEventListener.bind(this)})

    this.on('connect', () => {
      this.#isConnected = true

      // DEPRECATED
      {
        this.request({method: 'wallet_chainId'}).then(result => {
          this.#_chainId = result
          const networkId = parseInt(result, 16)
          this.#_networkVersion = networkId.toString(10)
        })
        this.request({method: 'wallet_accounts'})
          .then(result => {
            if (!result) this.#_selectedAddress = null
            else this.#_selectedAddress = result[0]
          })
          .catch(() => (this.#_selectedAddress = null))
        this.on('chainChanged', chainId => {
          this.#_chainId = chainId
          const networkId = parseInt(chainId, 16)
          this.#_networkVersion = networkId.toString(10)
        })
        this.on('accountsChanged', accounts => {
          this.#_selectedAddress = accounts[0]
        })
      }
    })
  }

  #_isUnlocked() {
    return this.request({method: 'wallet_isLocked'}).then(x => !x)
  }

  get _metamask() {
    return {
      isUnlocked: this.#_isUnlocked.bind(this),
    }
  }

  get _fluent() {
    return {
      isUnlocked: this.#_isUnlocked.bind(this),
    }
  }

  request(req) {
    return requestFactory(this.#send, req).then(res => {
      if (res.error) {
        console.error(res.error.message, res.error)
        throw res.error
      }
      return res.result
    })
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

  // DEPRECATED
  get chainId() {
    deprecated(
      'PROPERTY',
      '"provider.chainId" is deprecated, please use "provider.request({method: "(wallet|eth|cfx)_chainId"})" instead',
    )
    return this.#_chainId
  }

  // DEPRECATED
  get networkVersion() {
    deprecated(
      'PROPERTY',
      '"provider.networkVersion" is deprecated, please use "provider.request({method: "net_version"})" instead',
    )
    return this.#_networkVersion
  }

  // DEPRECATED
  get selectedAddress() {
    deprecated(
      'PROPERTY',
      '"provider.selectedAddress" is deprecated, please use "provider.request({method: "(wallet|eth|cfx)_accounts"})" instead',
    )
    return this.#_selectedAddress || null
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
      '"provider.enable" is deprecated, please use "provider.request({method: "(wallet|eth|cfx)_requestAccounts"})" instead',
    )
    return this.request({method: 'wallet_requestAccounts'})
  }

  // DEPRECATED
  sendAsync(payload, callback) {
    deprecated(
      'METHOD',
      '"provider.sendAsync" is deprecated, please use "provider.request" instead',
    )
    if (typeof callback !== 'function')
      throw new Error('Invalid callback, not a function')
    requestFactory(this.#send, payload)
      .then(res => callback(null, res))
      .catch(callback)
  }

  // DEPRECATED
  send(...args) {
    deprecated(
      'METHOD',
      '"provider.send" is deprecated, please use "provider.request" instead',
    )
    const [a1, a2] = args
    if (typeof a2 === 'function') return this.sendAsync(a1, a2)
    if (typeof a1 === 'string')
      return requestFactory(this.#send, {method: a1, params: a2}).then(res => {
        if (res.error) {
          console.error(res.error.message, res.error)
          throw res.error
        }
        return res
      })

    if (!a2 && typeof a1 === 'object') {
      if (
        a1.method === 'cfx_accounts' ||
        a1.method === 'eth_accounts' ||
        a1.method === 'wallet_accounts'
      ) {
        return this.selectedAddress
      }
      if (a1.method === 'cfx_netVersion' || a1.method === 'net_version') {
        return this.networkVersion
      }
    }
  }
}

export default Provider
