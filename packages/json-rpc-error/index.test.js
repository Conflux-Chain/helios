import {expect, describe, it} from 'vitest'
import * as err from './'

describe('json-rpc-error', () => {
  describe('perdefined errors', () => {
    it('should return the expected error message', async () => {
      expect(() => {
        throw new err.Parse('foo')
      }).toThrowError(`foo [${err.ERROR.PARSE.name} ${err.ERROR.PARSE.code}]\n`)

      expect(() => {
        throw new err.InvalidRequest('foo')
      }).toThrow(
        `foo [${err.ERROR.INVALID_REQUEST.name} ${err.ERROR.INVALID_REQUEST.code}]\n`,
      )

      expect(() => {
        throw new err.MethodNotFound('foo')
      }).toThrow(
        `foo [${err.ERROR.METHOD_NOT_FOUND.name} ${err.ERROR.METHOD_NOT_FOUND.code}]\n`,
      )

      expect(() => {
        throw new err.InvalidParams('foo')
      }).toThrow(
        `foo [${err.ERROR.INVALID_PARAMS.name} ${err.ERROR.INVALID_PARAMS.code}]\n`,
      )

      expect(() => {
        throw new err.Internal('foo')
      }).toThrow(
        `foo [${err.ERROR.INTERNAL.name} ${err.ERROR.INTERNAL.code}]\n`,
      )

      expect(() => {
        throw new err.Server('foo')
      }).toThrow(`foo [${err.ERROR.SERVER.name} ${err.ERROR.SERVER.code}]\n`)
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

  describe('errorInstanceToErrorCode', () => {
    it('should return the right error code', async () => {
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
