// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {validate} from '@cfxjs/spec'
import {main, schemas} from './index.js'

describe('@cfxjs/cfx_epoch-number', function () {
  describe('schemas', function () {
    it('should be able to validate the input', async function () {
      expect(validate(schemas.input)).toBeTruthy()
      expect(validate(schemas.input, [null])).toBeTruthy()
      expect(validate(schemas.input, [undefined])).toBeTruthy()
      expect(validate(schemas.input, ['0x1'])).toBeFalsy()
      expect(validate(schemas.input, ['latest_state'])).toBeTruthy()
      expect(
        validate(schemas.input, ['latest_state', 'latest_mined']),
      ).toBeFalsy()
      expect(validate(schemas.input, [1])).toBeFalsy()
    })
  })

  describe('main', function () {
    it('should call the injected fetch function with the input params', async function () {
      const input = {
        f: jest.fn(p => p),
        params: ['bar'],
      }
      const res = await main(input)
      expect(res).toStrictEqual(input.params)
      expect(input.f).toHaveBeenCalledTimes(1)
    })
  })
})
