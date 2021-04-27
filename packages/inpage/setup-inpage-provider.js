import {rpcStream} from '@cfxjs/extension-runtime/rpc-stream.js'
import {initProvider} from '@cfxjs/provider-api'

let PROVIDER = null

const setupProvider = () => {
  if (PROVIDER) return
  let sameOriginListener = () => {}
  window.addEventListener('message', e => {
    if (e.origin !== location.origin) return
    if (e.source !== window) return
    if (!e.data || !e.data.__fromFluentContentScript || !e.data.msg) return
    sameOriginListener(e?.data?.msg)
  })

  const post = msg =>
    window.postMessage({__fromFluentInpage: true, msg}, location.origin)

  PROVIDER = initProvider(
    rpcStream({
      postMessage: post,
      onMessage: {
        addListener(f) {
          sameOriginListener = f
        },
      },
    }),
  )

  window.cfx = PROVIDER
  PROVIDER.request({method: 'wallet_generateMnemonic'}).then(console.log)
  return window.cfx
}

setupProvider()
