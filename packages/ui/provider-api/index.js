import rndId from '@fluent-wallet/random-id'
import SafeEventEmitter from '@fluent-wallet/safe-event-emiter'
import ConfluxJS from 'js-conflux-sdk'

const requestFactory = (sendRequest, req) => {
  req.jsonrpc = '2.0'
  req.id = req.id ?? rndId()
  return sendRequest(req)
}

function deprecated(type, message) {
  // TODO: write a notice about deprecated warnings and add its url here
  console.warn(`%cDEPRECATED ${type}: ${message}`, 'color: red')
}

class Provider extends SafeEventEmitter {
  #s
  #send
  #isConnected
  isFluent = true
  // TODO: remote this
  isConfluxPortal = true
  constructor(stream, send) {
    super({
      allowedEventType: [
        // DEPRECATED
        'networkChanged',

        'connect',
        'disconnect',
        'accountsChanged',
        'chainChanged',
        'message',
      ],
    })
    this.#s = stream
    this.#send = send
    this.#s.subscribe({next: this.#streamEventListener.bind(this)})

    // DEPRECATED
    this.confluxJS = new ConfluxJS.Conflux()

    this.on('connect', () => {
      this.#isConnected = true

      // DEPRECATED
      {
        this.confluxJS.provider = {
          call: (method, ...params) => {
            params = params.reduce((acc, p) => {
              if (p === undefined) return acc
              return acc.concat([p])
            }, [])
            return this.request({method, params})
          },
          close() {},
          on() {},
        }
        this.request({method: 'cfx_chainId'}).then(result => {
          this._chainId = result
          const networkId = parseInt(result, 16)
          this._networkVersion = networkId.toString(10)
          this.confluxJS.networkId = networkId
          this.confluxJS.wallet.networkId = networkId
          this.emit('networkChanged', this._networkVersion)
          this.emit('chainChanged', this._chainId)
        })
        this.request({method: 'cfx_accounts'})
          .then(result => {
            if (!result) this._selectedAddress = undefined
            else this._selectedAddress = result[0]
            this.emit('accountsChanged', result)
          })
          .catch(() => (this._selectedAddress = undefined))
        this.on('chainChanged', chainId => {
          this._chainId = chainId
          const networkId = parseInt(chainId, 16)
          this._networkVersion = networkId.toString(10)
          this.confluxJS.networkId = networkId
          this.confluxJS.wallet.networkId = networkId
        })
        this.on('accountsChanged', accounts => {
          this._selectedAddress = accounts[0]
        })
      }
    })
  }
  // DEPRECATED
  get chainId() {
    deprecated(
      'PROPERTY',
      '"conflux.chainId" is deprecated, please use "conflux.request({method: "cfx_chainId"})" instead',
    )
    return this._chainId
  }

  // DEPRECATED
  get networkVersion() {
    deprecated(
      'PROPERTY',
      '"conflux.networkVersion" is deprecated, please use "conflux.request({method: "cfx_netVersion"})" instead',
    )
    return this._networkVersion
  }

  // DEPRECATED
  get selectedAddress() {
    deprecated(
      'PROPERTY',
      '"conflux.networkVersion" is deprecated, please use "conflux.request({method: "cfx_netVersion"})" instead',
    )
    return this._selectedAddress || undefined
  }

  request(req) {
    return requestFactory(this.#send, req).then(res => {
      if (res.error) throw res.error
      return res.result
    })
  }

  // DEPRECATED
  on(eventType, listener) {
    if (eventType === 'chainIdChanged') {
      eventType = 'chainChanged'
      deprecated(
        'EVENT',
        '"chainIdChanged" event is deprecated, it might be removed anytime without warning. Use "chainChanged" instead',
      )
    } else if (eventType === 'networkChanged') {
      deprecated(
        'EVENT',
        '"networkChanged" event is deprecated, it might be removed anytime without warning. Use "chainChanged" instead',
      )
    } else if (eventType === 'close') {
      eventType = 'disconnect'
      deprecated(
        'EVENT',
        '"close" event is deprecated, it might be removed anytime without warning. Use "disconnect" instead',
      )
    } else if (eventType === 'notification') {
      eventType = 'message'
      deprecated(
        'EVENT',
        '"notification" event is deprecated, it might be removed anytime without warning. Use "message" instead',
      )
    }

    return SafeEventEmitter.prototype.on.call(this, eventType, listener)
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
    this.request(payload)
      .then(res => callback(null, res))
      .catch(callback)
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
        return [this.selectedAddress]
      }
      if (a1.method === 'cfx_netVersion' || a1.method === 'net_version') {
        return this.networkVersion
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
    }
  }

  isConnected() {
    return this.#isConnected
  }
}

export const initProvider = (stream, send) => {
  return new Provider(stream, send)
}
