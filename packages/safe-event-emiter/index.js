import {CloseMode, pubsub} from '@thi.ng/rstream'
import {pluck} from '@cfxjs/transducers'
import {isFunction, isObject, isString} from '@cfxjs/checks'

export default class SafeEventEmitter {
  // #s
  #pb
  #allowedEventType = []
  #listeners = new Map()
  constructor(opts = {}) {
    const {allowedEventType = []} = opts
    this.#allowedEventType = allowedEventType
    this.#pb = pubsub({topic: ({topic} = {}) => topic})
    this.#pb.closeIn = CloseMode.NEVER
    this.#pb.closeOut = CloseMode.NEVER
    this.#pb.cache = true
    this.#pb.error = err => {
      this.onError.call(this, err)
      // https://github.com/thi-ng/umbrella/blob/fb6b5b76d16a75d157499f7ccf46c777a063131e/packages/rstream/src/api.ts#L114
      // so that stream won't go into ERROR state
      return true
    }
  }

  onError(error) {
    console.warn(
      'No error handler implemented, fallback to default error handler',
    )
    console.error(error)
  }

  #checkEventType(eventType) {
    if (!this.#allowedEventType.includes(eventType))
      throw new Error(`Invalid event type ${eventType}`)
  }
  #checkListener(listener) {
    if (!isFunction(listener)) throw new Error('listener is not a function')
  }

  #checkBeforeSub({eventType, listener} = {}) {
    this.#checkEventType(eventType)
    this.#checkListener(listener)
  }

  on(eventType, listener) {
    this.#checkBeforeSub({eventType, listener})
    if (this.#listeners.has(listener)) return
    const sub = {next: listener}
    this.#listeners.set(listener, sub)
    this.#pb.subscribeTopic(eventType, sub, {xform: pluck('data')})
  }

  once() {
    throw new Error('method once not supported')
  }

  off(eventType, listener) {
    this.#checkBeforeSub({eventType, listener})
    if (!this.#listeners.has(listener)) return
    this.#pb.unsubscribeTopic(eventType, this.#listeners.get(listener))
    this.#listeners.delete(listener)
  }

  emit(eventType, data) {
    this.#checkEventType(eventType)
    this.#pb.next({topic: eventType, data})
  }

  dispatchEvent(event, data) {
    if (isObject(event) && isString(event.type)) this.emit(event.type, data)
    throw new Error('invalid event.type')
  }
}

SafeEventEmitter.prototype.addEventListener = SafeEventEmitter.prototype.on
SafeEventEmitter.prototype.removeEventListener = SafeEventEmitter.prototype.off
