import {map} from '@cfxjs/transducers'
import {fromChannel} from '@thi.ng/rstream-csp'
import {chan} from '@cfxjs/csp'

export const defPort = port => {
  const outChan = chan()
  const inChan = chan()
  const inStream = fromChannel(inChan)
  const outStream = fromChannel(outChan)

  port.onMessage.addListener(inChan.write.bind(inChan))
  outStream.subscribe(map(port.postMessage))

  inStream.post = outChan.write.bind(outChan)

  inStream._port = port

  return inStream
}
