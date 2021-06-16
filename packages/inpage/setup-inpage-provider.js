import {rpcStream} from '@cfxjs/extension-runtime/rpc-stream.js'
import {initProvider} from '@cfxjs/provider-api'

let PROVIDER = null

const setupProvider = () => {
  if (PROVIDER) return
  let sameOriginListener = () => {}
  window.addEventListener('message', e => {
    if (e.origin !== location.origin) return
    if (e.source !== window) return
    if (
      !e.data ||
      !e.data.__fromFluentContentScript ||
      typeof e.data.msg !== 'object'
    )
      return
    if (!e.data.msg.id && e.data.msg.id !== 0) return
    if (!e.data.msg.error && !e.data.msg.result) return
    if (
      e.data.msg.error &&
      (!e.data.msg.error.message || !e.data.msg.error.code)
    )
      return
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

  const sendToBg = rpcStream({
    postMessage: post,
    onMessage: {
      addListener(f) {
        sameOriginListener = f
      },
    },
  })

  PROVIDER = initProvider(sendToBg)

  window.cfx = PROVIDER
  PROVIDER.request({method: 'wallet_generateMnemonic'}).then(console.log)
  return window.cfx
}

setupProvider()
