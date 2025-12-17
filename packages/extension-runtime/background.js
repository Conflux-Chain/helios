import browser from 'webextension-polyfill'
// eslint-disable-next-line no-unused-vars
import {stream, trace} from '@thi.ng/rstream'
import {siteRuntimeManager} from '@fluent-wallet/site-runtime-manager'

const popupStream = stream({
  id: 'popup',
  closeIn: false,
  closeOut: false,
  cache: false,
})
// popupStream.subscribe(trace('popup'))
const inpageStream = stream({
  id: 'inpage',
  closeIn: false,
  closeOut: false,
  cache: false,
})
// inpageStream.subscribe(trace('inpage'))

function onConnect(port) {
  const post = msg => {
    if (msg?.result === null) msg.result = '__null__'
    try {
      port.postMessage(msg)
    } catch (err) {
      // firefox can't serialize some of the postMessage data here
      // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Chrome_incompatibilities#data_cloning_algorithm
      if (err.message?.includes('object could not be cloned')) {
        try {
          msg = JSON.parse(JSON.stringify(msg))
          port.postMessage(msg)
        } catch (err) {
          console.warn('failed to post message', err)
        }
      } else {
        console.warn('failed to post message', err)
      }
    }
  }
  if (port?.name === 'popup') {
    port.onMessage.addListener(req =>
      popupStream.next.call(popupStream, [req, post]),
    )
  } else if (port?.name === 'content-script') {
    const postId = crypto.randomUUID()
    const origin = port?.sender?.url ? new URL(port.sender.url).host : undefined
    // content-script save post function for bidirectional communication
    if (origin) {
      siteRuntimeManager.addPostListener(origin, {
        post,
        postId,
      })
    }
    port.onMessage.addListener(req => {
      inpageStream.next.call(inpageStream, [req, post])
    })
    // remove post function when port disconnect
    port.onDisconnect.addListener(() => {
      if (origin) {
        siteRuntimeManager.removePostListener(origin, postId)
      }
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
