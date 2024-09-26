import {expect, describe, it, vi} from 'vitest'
import {rpcStream} from './rpc-stream.js'

describe('@fluent-wallet/extension-runtime/rpc-stream.js', () => {
  describe('rpcStream', () => {
    it('should return the send fn of the pubsub stream', async () => {
      let pubsubStreamNext, postReq

      const port = {
        onMessage: {
          addListener: vi.fn(next => (pubsubStreamNext = next)),
        },
        postMessage: vi.fn(req => (postReq = req)),
      }

      const {send} = rpcStream(port)

      expect(typeof send).toBe('function')
      expect(port.onMessage.addListener).toHaveBeenCalled()
      expect(typeof pubsubStreamNext).toBe('function')

      const res = send({id: 1, msg: 'foo'})
      expect(port.postMessage).toHaveBeenCalled()
      expect(postReq.id).toBe(1)
      expect(postReq.msg).toBe('foo')
      expect(res instanceof Promise).toBe(true)

      pubsubStreamNext({id: 2, msg: 'foo'})
      pubsubStreamNext({id: 1, msg: 'bar'})
      expect(await res).toEqual({id: 1, msg: 'bar'})

      pubsubStreamNext({id: 1, msg: 'bar'})
      pubsubStreamNext({id: 1, msg: 'bar'})
      const res2 = send({id: 2, msg: 'bar'})
      pubsubStreamNext({id: 2, msg: 'foo'})
      expect(await res2).toEqual({id: 2, msg: 'foo'})
    })
  })
})
