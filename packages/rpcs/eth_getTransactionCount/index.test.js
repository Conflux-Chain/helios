// eslint-disable-next-line no-unused-vars
import { expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach } from '@jest/globals' // prettier-ignore
import {main} from './'

describe('@cfxjs/eth_get-transaction-count', function () {
  describe('main', function () {
    test('logic', async () => {
      const input = {f: jest.fn(a => a), params: []}
      input.params = ['0x814f4FE000Fc0E1737791D2354df7A415730E373', 'latest']
      let res = await main(input)
      expect(res).toStrictEqual(input.params)
      expect(input.f).toHaveBeenCalledTimes(1)
    })
  })
})
