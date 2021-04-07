// eslint-disable-next-line no-unused-vars
import {expect, describe, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import * as err from './'

describe('json-rpc-error', function () {
  describe('perdefined errors', function () {
    it('should return the expected error message', async function () {
      expect(() => {
        throw new err.Parse('foo')
      }).toThrowError(
        `JSON-RPC ${err.ERROR.PARSE.name} ${err.ERROR.PARSE.code}\nfoo`,
      )

      expect(() => {
        throw new err.InvalidRequest('foo')
      }).toThrow(
        `JSON-RPC ${err.ERROR.INVALID_REQUEST.name} ${err.ERROR.INVALID_REQUEST.code}\nfoo`,
      )

      expect(() => {
        throw new err.MethodNotFound('foo')
      }).toThrow(
        `JSON-RPC ${err.ERROR.METHOD_NOT_FOUND.name} ${err.ERROR.METHOD_NOT_FOUND.code}\nfoo`,
      )

      expect(() => {
        throw new err.InvalidParams('foo')
      }).toThrow(
        `JSON-RPC ${err.ERROR.INVALID_PARAMS.name} ${err.ERROR.INVALID_PARAMS.code}\nfoo`,
      )

      expect(() => {
        throw new err.Internal('foo')
      }).toThrow(
        `JSON-RPC ${err.ERROR.INTERNAL.name} ${err.ERROR.INTERNAL.code}\nfoo`,
      )

      expect(() => {
        throw new err.Server('foo')
      }).toThrow(
        `JSON-RPC ${err.ERROR.SERVER.name} ${err.ERROR.SERVER.code}\nfoo`,
      )
    })
  })
})
