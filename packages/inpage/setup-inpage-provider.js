import {rpcStream} from '@fluent-wallet/extension-runtime/rpc-stream.js'
import {initProvider} from '@fluent-wallet/provider-api'
import {takeOver} from './take-over-portal'

let PROVIDER = null

function validateMessage(e) {
  if (e.origin !== location.origin) return
  if (e.source !== window) return
  if (!e.data) return
  if (!e.data.__fromFluentContentScript) return
  if (typeof e.data.msg !== 'object') return
  if (e.data.msg.event) return true
  if (!e.data.msg.id && e.data.msg.id !== 0) return
  if (!e.data.msg.error && !e.data.msg.result) return
  if (e.data.msg.error && (!e.data.msg.error.message || !e.data.msg.error.code))
    return

  return true
}

const FLUENT_USE_MORDEN_PROVIDER_API = '__FLUENT_USE_MORDEN_PROVIDER_API__'

function setupProvider() {
  if (PROVIDER) return
  let sameOriginListener = () => {}
  window.addEventListener('message', e => {
    if (!validateMessage(e)) return

    if (e.data.msg.event === FLUENT_USE_MORDEN_PROVIDER_API) {
      if (e.data.msg.event.params) {
        if (window.localStorage.getItem(FLUENT_USE_MORDEN_PROVIDER_API)) return
        window.localStorage.setItem(FLUENT_USE_MORDEN_PROVIDER_API, true)
      } else {
        if (!window.localStorage.getItem(FLUENT_USE_MORDEN_PROVIDER_API)) return
        window.localStorage.removeItem(FLUENT_USE_MORDEN_PROVIDER_API)
      }

      window.location.reload()
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

  const {send: sendToBg, stream} = rpcStream({
    postMessage: post,
    onMessage: {
      addListener(f) {
        sameOriginListener = f
      },
    },
  })

  PROVIDER = initProvider(
    stream,
    sendToBg,
    Boolean(window.localStorage.getItem(FLUENT_USE_MORDEN_PROVIDER_API)),
  )
  window.cfx = PROVIDER
  window.conflux = PROVIDER
  window.confluxJS = PROVIDER.confluxJS
  takeOver(PROVIDER)
  return PROVIDER
}

setupProvider()
