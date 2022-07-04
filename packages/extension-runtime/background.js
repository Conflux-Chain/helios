import browser from 'webextension-polyfill'
// eslint-disable-next-line no-unused-vars
import {stream, trace} from '@thi.ng/rstream'

import {capture as sentryCaptureError} from '@fluent-wallet/sentry'

function sentryCapturePostMessageeError(err) {
  // skip disconnected port error
  // these errors indicating bg try to post message to closed popup
  if (!err?.message?.includes('disconnected port'))
    sentryCaptureError(err, {tags: {custom_type: 'error postMessage'}})
}

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
          sentryCapturePostMessageeError(err)
        }
      } else {
        sentryCapturePostMessageeError(err)
      }
    }
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
