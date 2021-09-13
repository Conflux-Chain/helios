import browser from 'webextension-polyfill'
import {stream} from '@thi.ng/rstream'
import {getSiteMetadata} from '@fluent-wallet/site-metadata'

let CONNECT_RETRY_COUNT = 0
let INPAGE_INJECTED = false
let s

// need to call this after inpage.js is injected
// so that the dapp page can get the connected event
function registerSite() {
  if (!s) return
  getSiteMetadata().then(metadata => {
    if (!metadata.icon) delete metadata.icon
    s.next.call(s, {
      method: 'wallet_registerSiteMetadata',
      params: metadata,
      _origin: location.host,
    })
  })
}

function setup() {
  s = stream({
    id: 'content-script',
    closeIn: false,
    closeOut: false,
    cache: false,
  })
  const port = browser.runtime.connect({name: 'content-script'})
  const sub = {next: port.postMessage.bind(port)}

  s.subscribe(sub)

  const listenToInpageMessage = e => {
    CONNECT_RETRY_COUNT = 0
    if (e.origin !== location.origin) return
    if (e.source !== window) return
    if (
      !e.data ||
      !e.data.__fromFluentInpage ||
      !e.data.msg ||
      typeof e.data.msg !== 'object'
    )
      return
    if (!e.data.msg.method) return
    if (e.data.msg.jsonrpc !== '2.0') return
    if (!Number.isInteger(e.data.msg.id)) return
    if (e.data.msg.method === 'wallet_registerSiteMetadata') return
    s.next.call(s, {...e.data.msg, _origin: location.host})
  }

  window.addEventListener('message', listenToInpageMessage, false)

  port.onDisconnect.addListener(() => {
    window.postMessage({
      msg: {
        event: 'disconnect',
        params: {
          code: 4900,
          message:
            "Can't connect to extension runtime, disconnected from all chain. Please refresh the page or tell user to refresh the page.",
        },
      },
    })
    window.removeEventListener('message', listenToInpageMessage)
    s.unsubscribe(sub)
    s = null
    if (CONNECT_RETRY_COUNT >= 10) {
      return
    }
    console.info(
      `Failed to connect background, retry: ${++CONNECT_RETRY_COUNT}`,
    )
    setup()
  })

  port.onMessage.addListener(e => {
    window.postMessage(
      {msg: e, __fromFluentContentScript: true},
      location.origin,
    )
  })

  if (INPAGE_INJECTED) registerSite()
}

setup()

function injectInpage() {
  window.removeEventListener('DOMContentLoaded', injectInpage)
  const inpage = document.createElement('script')
  inpage.src = browser.runtime.getURL('inpage.js')
  inpage.async = false
  document.head.appendChild(inpage)
  INPAGE_INJECTED = true
  registerSite()
}

window.addEventListener('DOMContentLoaded', injectInpage)
