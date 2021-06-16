import browser from 'webextension-polyfill'
import {stream} from '@thi.ng/rstream'

const s = stream({
  id: 'content-script',
  closeIn: false,
  closeOut: false,
  cache: false,
})

const port = browser.runtime.connect({name: 'content-script'})

s.subscribe({next: port.postMessage.bind(port)})

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
  if (!e.data.msg.method) return
  if (e.data.msg.jsonrpc !== '2.0') return
  if (!Number.isInteger(e.data.msg.id)) return
  s.next.call(s, {...e.data.msg, _origin: location.host})
}

window.addEventListener('message', listenToInpageMessage, false)

port.onDisconnect.addListener(() =>
  window.removeEventListener(listenToInpageMessage),
)

port.onMessage.addListener(e =>
  window.postMessage(
    {msg: e, __fromFluentContentScript: true},
    location.origin,
  ),
)

function injectInpage() {
  const inpage = document.createElement('script')
  inpage.src = browser.extension.getURL('inpage.js')
  inpage.async = false
  document.head.appendChild(inpage)
}

window.addEventListener('DOMContentLoaded', injectInpage)
