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
  if (port?.name === 'popup') {
    port.onMessage.addListener(popupStream.next.bind(popupStream))
    popupStream.post = port.postMessage.bind(port)
  } else if (port?.name === 'inpage') {
    port.onMessage.addListener(inpageStream.next.bind(inpageStream))
    inpageStream.post = port.postMessage.bind(port)
  }
}

export function listen() {
  browser.runtime.onConnect.addListener(onConnect)
  return {
    popupStream,
    inpageStream,
  }
}
