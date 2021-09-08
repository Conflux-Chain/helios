import rndId from '@fluent-wallet/random-id'
import SafeEventEmitter from '@fluent-wallet/safe-event-emiter'

const requestFactory = (sendRequest, req) => {
  req.jsonrpc = '2.0'
  req.id = req.id ?? rndId()
  return sendRequest(req)
}

class Provider extends SafeEventEmitter {
  #s
  #send
  isFluent = true
  constructor(stream, send) {
    super({
      allowedEventType: [
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
  }

  request(req) {
    return requestFactory(this.#send, req)
  }

  #streamEventListener(msg = {}) {
    const {event, params, id} = msg
    if (id !== undefined) return
    if (!event) return
    this.emit(event, params)
  }
}

export const initProvider = (stream, send) => {
  return new Provider(stream, send)
}
