import browser from 'webextension-polyfill'
import {stream} from '@thi.ng/rstream'
import {getSiteMetadata} from '@fluent-wallet/site-metadata'

function _retry() {
  let retryTimeout = 100
  if (CONNECT_RETRY_COUNT >= 10) {
    retryTimeout = 1000
  } else if (CONNECT_RETRY_COUNT >= 60) {
    retryTimeout = 30000
  } else if (CONNECT_RETRY_COUNT >= 120) {
    console.error(
      `[Fluent] Failed to connect background with 120 retry. Give up`,
    )
    return
  }

  console.warn(
    `[Fluent] Failed to connect background, retry: ${++CONNECT_RETRY_COUNT}`,
  )
  setTimeout(setup, retryTimeout)
}

let CONNECT_RETRY_COUNT = 0
let s

// need to call this after inpage.js is injected
// so that the dapp page can get the connected event
function registerSite() {
  if (!s) return
  getSiteMetadata()
    .then(metadata => {
      if (!metadata.icon) delete metadata.icon
      s.next.call(s, {
        method: 'wallet_registerSiteMetadata',
        params: metadata,
        _origin: location.host,
      })
    })
    .catch(() => null)
}

function setup() {
  s = stream({
    id: 'content-script',
    closeIn: false,
    closeOut: false,
    cache: false,
  })

  let port
  try {
    port = browser.runtime.connect({name: 'content-script'})
  } catch (err) {
    // reload dapp page when ext bg is reloaded
    // this only happends in development env
    if (err.message.match(/extension.*context.*invalid/i))
      setTimeout(() => window.location.reload(), 500)
    else _retry()
  }
  if (!port) return
  const sub = {next: port.postMessage.bind(port)}

  s.subscribe(sub)

  const listenToInpageMessage = e => {
    if (e.origin !== location.origin) return
    if (e.source !== window) return
    if (
      !e.data ||
      !e.data.__fromFluentInpage ||
      !e.data.msg ||
      typeof e.data.msg !== 'object'
    )
      return
    if (e.data.msg.event === '__INPAGE_INJECTED__') {
      registerSite()
      return
    }
    if (!e.data.msg.method) return
    if (e.data.msg.jsonrpc !== '2.0') return
    if (!Number.isInteger(e.data.msg.id)) return
    if (e.data.msg.method === 'wallet_registerSiteMetadata') return
    CONNECT_RETRY_COUNT = 0
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
    _retry()
  })

  port.onMessage.addListener(e => {
    window.postMessage(
      {msg: e, __fromFluentContentScript: true},
      location.origin,
    )
  })

  registerSite()
}
setup()
