import browser from 'webextension-polyfill'
import {stream} from '@thi.ng/rstream'

const popupStream = stream({
  id: 'popup',
  closeIn: false,
  closeOut: false,
  cache: false,
})
const inpageStream = stream({
  id: 'inpage',
  closeIn: false,
  closeOut: false,
  cache: false,
})

function onConnect(port) {
  const post = msg => {
    if (msg?.result === null) msg.result = '__null__'
    try {
      port.postMessage(msg)
    } catch (err) {} // eslint-disable-line no-empty
  }
  if (port?.name === 'popup') {
    port.onMessage.addListener(req =>
      popupStream.next.call(popupStream, [req, post]),
    )
  } else if (port?.name === 'content-script') {
    port.onMessage.addListener(req => {
      inpageStream.next.call(inpageStream, [req, post])
    })
  }
}

export function listen() {
  browser.runtime.onConnect.addListener(onConnect)
  return {
    popupStream,
    inpageStream,
  }
}
