import {rpcStream} from '@fluent-wallet/extension-runtime/rpc-stream.js'
import {initProvider} from '@fluent-wallet/provider-api'
import {announceProvider} from './eip-6963'
import {v4 as uuid} from 'uuid'

const FLUENT_SVG =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBjbGlwLXBhdGg9InVybCgjY2xpcDBfMTAwMV8yKSI+PHBhdGggZmlsbD0iI0YwRjBGMCIgZD0iTTAgMGg5NnY5NkgweiIvPjxwYXRoIGQ9Ik03NSAyMXY4LjY4OGMwIDEwLTguMDMyIDE4LjEyNS0xOC4wMDIgMTguMjg3bC0uMzAzLjAwMkg0OHY4LjcxQzQ4IDY2Ljk3NSAzOS44MzIgNzUgMjkuNzcgNzVIMjF2LTguOTQ1LTE5LjQ1QzIxIDMyLjQ2NCAzMi40NzQgMjEgNDYuNjI3IDIxSDc1eiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNjMuNDA4IDIxSDc1djguNjg3Qzc1IDM5Ljk3NSA2Ni44MzIgNDggNTYuNzcgNDhINDh2LTguOTM4QzQ4IDI5Ljk0NiA1NC42NzUgMjIuMzg4IDYzLjQwOCAyMXoiIGZpbGw9IiMyNDIyNjUiIGZpbGwtb3BhY2l0eT0iLjgiLz48cGF0aCBkPSJNNzUgMjF2OC42ODhjMCAxMC04LjAzMiAxOC4xMjUtMTguMDAyIDE4LjI4N2wtLjMwMy4wMDJINDh2OC43MUM0OCA2Ni45NzUgMzkuODMyIDc1IDI5Ljc3IDc1SDIxdi04Ljk0NS0xOS40NUMyMSAzMi40NjQgMzIuNDc0IDIxIDQ2LjYyNyAyMUg3NXoiIGZpbGw9IiM2MTZFRTEiIGZpbGwtb3BhY2l0eT0iLjgiLz48L2c+PGRlZnM+PGNsaXBQYXRoIGlkPSJjbGlwMF8xMDAxXzIiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDBoOTZ2OTZIMHoiLz48L2NsaXBQYXRoPjwvZGVmcz48L3N2Zz4='

let PROVIDER = null

function validateMessage(e) {
  if (e.origin !== location.origin) return
  if (e.source !== window) return
  if (!e.data) return
  if (!e.data.__fromFluentContentScript) return
  if (typeof e.data.msg !== 'object') return
  if (e.data.msg.event) return true
  if (!e.data.msg.id && e.data.msg.id !== 0) return
  if (!e.data.msg.error && e.data.msg.result === undefined) return
  if (e.data.msg.error && (!e.data.msg.error.message || !e.data.msg.error.code))
    return

  return true
}

const FLUENT_BACKEND_PREFERENCES = '__FLUENT_BACKEND_PREFERENCES__'
const FLUENT_OVERRIDE_WINDOW_DOT_ETHEREUM =
  '__FLUENT_OVERRIDE_WINDOW_DOT_ETHEREUM__'

function maybeOverrideWindowDotEthereum(overrideWindowDotEthereum) {
  if (overrideWindowDotEthereum) {
    if (!window.localStorage.getItem(FLUENT_OVERRIDE_WINDOW_DOT_ETHEREUM)) {
      window.localStorage.setItem(FLUENT_OVERRIDE_WINDOW_DOT_ETHEREUM, 'true')
      window.location.reload()
    }
  } else {
    if (!window.localStorage.getItem(FLUENT_OVERRIDE_WINDOW_DOT_ETHEREUM))
      return

    window.localStorage.removeItem(FLUENT_OVERRIDE_WINDOW_DOT_ETHEREUM)
    window.location.reload()
  }
}

function setupProvider() {
  if (PROVIDER) return
  let sameOriginListener = () => {}
  window.addEventListener('message', e => {
    if (!validateMessage(e)) return

    if (e.data.msg.event === FLUENT_BACKEND_PREFERENCES) {
      maybeOverrideWindowDotEthereum(
        e.data.msg.params.overrideWindowDotEthereum,
      )

      return
    }

    sameOriginListener(e.data.msg)
  })

  const post = msg =>
    window.postMessage(
      {
        __fromFluentInpage: true,
        msg,
      },
      location.origin,
    )

  post({
    event: '__INPAGE_INJECTED__',
  })

  const {send: sendToBg, stream} = rpcStream({
    postMessage: post,
    onMessage: {
      addListener(f) {
        sameOriginListener = f
      },
    },
  })

  PROVIDER = initProvider(stream, sendToBg)
  announceProvider({
    info: {
      uuid: uuid(),
      name: 'Fluent',
      icon: FLUENT_SVG,
      rdns: 'com.fluentwallet',
    },
    provider: PROVIDER,
  })

  window.fluent = PROVIDER
  if (!window.ethereum) window.ethereum = PROVIDER
  Object.defineProperty(window, 'conflux', {value: PROVIDER, writable: false})
  if (window.localStorage.getItem(FLUENT_OVERRIDE_WINDOW_DOT_ETHEREUM)) {
    try {
      Object.defineProperty(window, 'ethereum', {
        value: PROVIDER,
        writable: false,
        configurable: false,
      })
    } catch (error) {
      console.log('Failed to override window.ethereum', error)
    }
  }
  return PROVIDER
}

setupProvider()
