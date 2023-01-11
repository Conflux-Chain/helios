import {CloseMode, pubsub, stream} from '@thi.ng/rstream'
import {pluck} from '@fluent-wallet/transducers'
import {isFunction, isObject, isString} from '@fluent-wallet/checks'

// ui/provider-api 的基类
export default class SafeEventEmitter {
  // #s
  #pb
  #streams = {}
  #allowedEventType = []
  #listeners = new Map()
  constructor(opts = {}) {
    const {allowedEventType = [], streamCacheLast = false} = opts
    this.#allowedEventType = allowedEventType

    // NodeJS event emitter events
    if (!this.#allowedEventType.includes('error'))
      this.#allowedEventType = [...this.#allowedEventType, 'error']
    if (!this.#allowedEventType.includes('close'))
      this.#allowedEventType = [...this.#allowedEventType, 'close']

    this.#pb = pubsub({topic: ({topic} = {}) => topic})
    this.#pb.closeIn = CloseMode.NEVER
    this.#pb.closeOut = CloseMode.NEVER
    this.#pb.error = err => {
      this.onError.call(this, err)
      // https://github.com/thi-ng/umbrella/blob/fb6b5b76d16a75d157499f7ccf46c777a063131e/packages/rstream/src/api.ts#L114
      // so that stream won't go into ERROR state
      return true
    }
    this.#streams = this.#allowedEventType.reduce((acc, eventType) => {
      const s = stream({
        closeIn: CloseMode.NEVER,
        closeOut: CloseMode.NEVER,
        cache: streamCacheLast,
        id: `topic-${eventType}`,
      })
      // pluck 摘取 data 字段
      // Transducer to transform incoming stream values.
      // If given, all child subscriptions will only receive the transformed result values.
      this.#pb.subscribeTopic(eventType, s, {xform: pluck('data')})
      return {
        ...acc,
        [eventType]: s,
      }
    }, {})
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
  // 子类一开始 构建的时候 会执行 on("connect")，就是添加第一个监听器
  // listener 就是 来自dapp 的回调函数
  on(eventType, listener) {
    this.#checkBeforeSub({eventType, listener})
    if (this.#listeners.has(listener)) return this
    const sub = {next: listener}
    this.#listeners.set(listener, sub)
    // 给对应事件类型的stream 添加上 监听事件
    this.#streams[eventType].subscribe(sub)
    return this
  }

  once() {
    throw new Error('method once is not supported')
  }

  off(eventType, listener) {
    this.#checkBeforeSub({eventType, listener})
    if (!this.#listeners.has(listener)) return this
    this.#streams[eventType].unsubscribe(this.#listeners.get(listener))
    this.#listeners.delete(listener)
    return this
  }

  removeListener(...args) {
    return this.off(...args)
  }

  removeAllListeners() {
    Object.values(this.#streams).forEach(s =>
      [...s.subs].forEach(sub => sub.unsubscribe()),
    )
    this.#listeners = new Map()
    return this
  }
  // 子类  this.#s.subscribe({next: this.#streamEventListener.bind(this)})
  // 会触发。子类的#S来自于外界传入的
  emit(eventType, data) {
    this.#checkEventType(eventType)
    // 这里最终会执行到 on的时候添加的event type
    this.#pb.next({topic: eventType, data})
    return true
  }

  dispatchEvent(event, data) {
    if (isObject(event) && isString(event.type))
      return this.emit(event.type, data)
    throw new Error('invalid event.type')
  }
}

SafeEventEmitter.prototype.addEventListener = SafeEventEmitter.prototype.on
SafeEventEmitter.prototype.removeEventListener = SafeEventEmitter.prototype.off
