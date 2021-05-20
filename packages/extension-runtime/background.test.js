// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {listen} from './background.js'

describe('@cfxjs/extension-runtime/background.js', function () {
  describe('listen', function () {
    it('should listen for port with name popup/content-script', async function () {
      let p, i, port, onConnect, listener
      browser.runtime.onConnect.addListener = jest.fn(f => (onConnect = f))
      const {popupStream, inpageStream} = listen()
      expect(typeof onConnect).toBe('function')
      popupStream.subscribe({
        next([msg]) {
          p = msg
        },
      })
      inpageStream.subscribe({
        next([msg]) {
          i = msg
        },
      })

      port = {
        onMessage: {
          addListener: jest.fn(l => (listener = l)),
        },
        postMessage: {bind: jest.fn()},
      }

      onConnect({...port, name: 'foo'})
      expect(listener).toBe(undefined)

      onConnect({...port, name: 'popup'})
      expect(typeof listener).toBe('function')
      listener('a')
      expect(p).toBe('a')
      expect(i).toBe(undefined)

      onConnect({...port, name: 'content-script'})
      expect(typeof listener).toBe('function')
      listener('b')
      expect(p).toBe('a')
      expect(i).toBe('b')
    })
  })
})
