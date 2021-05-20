// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {rpcStream} from './rpc-stream.js'

describe('@cfxjs/extension-runtime/rpc-stream.js', function () {
  describe('rpcStream', function () {
    it('should return the send fn of the pubsub stream', async function () {
      let pubsubStreamNext, postReq

      const port = {
        onMessage: {
          addListener: jest.fn(next => (pubsubStreamNext = next)),
        },
        postMessage: jest.fn(req => (postReq = req)),
      }

      const send = rpcStream(port)

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
