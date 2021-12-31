// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {main} from './'

describe('@fluent-wallet/cfx_get-next-nonce', function () {
  describe('main', function () {
    test('logic', async () => {
      const input = {f: jest.fn(a => a), params: []}
      input.params = [
        'cfx:aajj1b1gm7k51mhzm80czcx31kwxrm2f6jxvy30mvk',
        'latest_state',
      ]
      let res = await main(input)
      expect(res).toStrictEqual(input.params)
      expect(input.f).toHaveBeenCalledTimes(1)
    })
  })
})
