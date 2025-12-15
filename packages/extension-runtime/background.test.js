import {expect, describe, it, vi} from 'vitest'
import {listen} from './background.js'

describe('@fluent-wallet/extension-runtime/background.js', () => {
  describe('listen', () => {
    it('should listen for port with name popup/content-script', async () => {
      let p, i, port, onConnect, listener
      browser.runtime.onConnect.addListener = vi.fn(f => (onConnect = f))
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
          addListener: vi.fn(l => (listener = l)),
        },
        postMessage: {bind: vi.fn()},
        onDisconnect: {
          addListener: vi.fn(),
        },
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
