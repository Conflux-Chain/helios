// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import * as err from './'

describe('json-rpc-error', function () {
  describe('perdefined errors', function () {
    it('should return the expected error message', async function () {
      expect(() => {
        throw new err.Parse('foo')
      }).toThrowError(
        `JSON-RPC ${err.ERROR.PARSE.name} ${err.ERROR.PARSE.code}\n\nfoo`,
      )

      expect(() => {
        throw new err.InvalidRequest('foo')
      }).toThrow(
        `JSON-RPC ${err.ERROR.INVALID_REQUEST.name} ${err.ERROR.INVALID_REQUEST.code}\n\nfoo`,
      )

      expect(() => {
        throw new err.MethodNotFound('foo')
      }).toThrow(
        `JSON-RPC ${err.ERROR.METHOD_NOT_FOUND.name} ${err.ERROR.METHOD_NOT_FOUND.code}\n\nfoo`,
      )

      expect(() => {
        throw new err.InvalidParams('foo')
      }).toThrow(
        `JSON-RPC ${err.ERROR.INVALID_PARAMS.name} ${err.ERROR.INVALID_PARAMS.code}\n\nfoo`,
      )

      expect(() => {
        throw new err.Internal('foo')
      }).toThrow(
        `JSON-RPC ${err.ERROR.INTERNAL.name} ${err.ERROR.INTERNAL.code}\n\nfoo`,
      )

      expect(() => {
        throw new err.Server('foo')
      }).toThrow(
        `JSON-RPC ${err.ERROR.SERVER.name} ${err.ERROR.SERVER.code}\n\nfoo`,
      )
    })
  })

  // error stack changed after the jest updates, will fix/remove this later
  // describe('errorStackPop', function () {
  //   it('should pop uppermost level of the error stack', async function () {
  //     const error = new Error('foo')
  //     const stackBefore = error.stack.slice()
  //     err.errorStackPop(error)
  //     const stackAfter = error.stack.slice()
  //     const linesBefore = stackBefore.split('\n')
  //     const linesAfter = stackAfter.split('\n')
  //     expect(linesBefore.length - linesAfter.length).toBe(2)
  //     expect(linesBefore[linesBefore.length - 1]).toEqual(
  //       linesAfter[linesAfter.length - 1],
  //     )
  //   })
  // })

  describe('errorInstanceToErrorCode', function () {
    it('should return the right error code', async function () {
      expect(err.errorInstanceToErrorCode(new err.Parse())).toBe(
        err.ERROR.PARSE.code,
      )

      expect(err.errorInstanceToErrorCode(new err.InvalidRequest())).toBe(
        err.ERROR.INVALID_REQUEST.code,
      )

      expect(err.errorInstanceToErrorCode(new err.MethodNotFound())).toBe(
        err.ERROR.METHOD_NOT_FOUND.code,
      )

      expect(err.errorInstanceToErrorCode(new err.InvalidParams())).toBe(
        err.ERROR.INVALID_PARAMS.code,
      )

      expect(err.errorInstanceToErrorCode(new err.Internal())).toBe(
        err.ERROR.INTERNAL.code,
      )

      expect(err.errorInstanceToErrorCode(new err.Server())).toBe(
        err.ERROR.SERVER.code,
      )
    })
  })
})
