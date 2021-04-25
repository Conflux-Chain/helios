import browser from 'webextension-polyfill'
import {compL} from '@cfxjs/compose'
import {map} from '@cfxjs/transducers'
import {fromChannel} from '@thi.ng/rstream-csp'
import {chan} from '@cfxjs/csp'
import {defPort} from './port.js'

export function listen() {
  const connectChan = chan()
  const connectS = fromChannel(connectChan)
  const newPortChan = chan()
  const newPortS = fromChannel(newPortChan)
  connectS.subscribe(map(compL(defPort, newPortChan.write.bind(newPortChan))))

  browser.runtime.onConnect.addListener(connectChan.write.bind(connectChan))

  return newPortS
}
