// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {main} from './index.js'

describe('@cfxjs/cfx_get-account', function () {
  describe('main', function () {
    test('logic', async () => {
      const input = {
        f: jest.fn(r => r),
        params: {foo: 'bar'},
      }

      const res = await main(input)
      expect(input.f).toHaveBeenCalledTimes(1)
      expect(res).toStrictEqual(input.params)
    })
  })
})
