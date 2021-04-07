// eslint-disable-next-line no-unused-vars
import {expect, describe, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {rpcErrorHandler} from './error'

describe('error', function () {
  describe('rpcErrorHandler', function () {
    it('should append the error message with rpc stack', async function () {
      const fakeCWrite = jest.fn()

      rpcErrorHandler({message: 'original error message'}, undefined, {
        method: 'm0',
        _rpcStack: ['m1', 'm2'],
        _c: {
          write: fakeCWrite,
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
      expect(fakeCWrite.mock.calls[0][0].error.data.message).toStrictEqual(
        fakeCWrite.mock.calls[0][0].error.message,
      )

      rpcErrorHandler({message: 'original error message'}, undefined, {
        method: 'm0',
        _c: {
          write: fakeCWrite,
        },
      })

      expect(fakeCWrite.mock.calls[1][0].error.message).toContain('-> m0')

      expect(() =>
        rpcErrorHandler(null, undefined, {
          method: 'm0',
          _c: {
            write: fakeCWrite,
          },
        }),
      ).toThrowError('Invalid error')
    })

    it('should return the response with the same req id', async function () {
      const fakeCWrite = jest.fn()

      rpcErrorHandler({message: 'original error message'}, undefined, {
        method: 'm0',
        id: 3,
        _rpcStack: ['m1', 'm2'],
        _c: {
          write: fakeCWrite,
        },
      })

      expect(fakeCWrite.mock.calls[0][0].id).toBe(3)
    })
  })
})
