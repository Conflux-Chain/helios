import {expect, describe, it, vi} from 'vitest'
import {rpcErrorHandlerFactory} from './error'

describe('error', () => {
  describe('rpcErrorHandlerFactory', () => {
    it('should append the error message with rpc stack', async () => {
      const fakeCWrite = vi.fn()

      rpcErrorHandlerFactory()({
        message: 'original error message',
        extra: {foo: 'bar'},
        rpcData: {
          method: 'm0',
          _rpcStack: ['m1', 'm2'],
          _c: {
            write: fakeCWrite,
          },
        },
      })

      expect(fakeCWrite.mock.calls[0][0].jsonrpc).toBe('2.0')
      expect(fakeCWrite.mock.calls[0][0].id).toBe(2)
      expect(fakeCWrite.mock.calls[0][0].error.code).toBe(-32000)
      expect(fakeCWrite.mock.calls[0][0].error.message).toContain('RPC Stack:')
      expect(fakeCWrite.mock.calls[0][0].error.message).toContain(
        'original error message',
      )
      expect(fakeCWrite.mock.calls[0][0].error.message).toContain('-> m1')
      expect(fakeCWrite.mock.calls[0][0].error.message).toContain('-> m2')
      expect(fakeCWrite.mock.calls[0][0].error.data).toStrictEqual({foo: 'bar'})

      rpcErrorHandlerFactory()({
        message: 'original error message',
        rpcData: {
          method: 'm0',
          _c: {
            write: fakeCWrite,
          },
        },
      })

      expect(fakeCWrite.mock.calls[1][0].error.message).toContain('-> m0')

      expect(rpcErrorHandlerFactory()(null)).toBe(true)
    })

    it('should return the response with the same req id', async () => {
      const fakeCWrite = vi.fn()

      rpcErrorHandlerFactory()({
        message: 'original error message',
        rpcData: {
          method: 'm0',
          id: 3,
          _rpcStack: ['m1', 'm2'],
          _c: {
            write: fakeCWrite,
          },
        },
      })

      expect(fakeCWrite.mock.calls[0][0].id).toBe(3)
    })
  })
})
