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

window.addEventListener(
  'message',
  e => {
    if (e.origin !== location.origin) return
    if (e.source !== window) return
    if (!e.data || !e.data.__fromFluentInpage || !e.data.msg) return
    s.next.call(s, e.data.msg)
  },
  false,
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
