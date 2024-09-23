import {expect, describe, test, vi} from 'vitest'
import {main} from './index.js'

describe('@fluent-wallet/cfx_get-account', () => {
  describe('main', () => {
    test('logic', async () => {
      const input = {
        f: vi.fn(r => r),
        params: {foo: 'bar'},
      }

      const res = await main(input)
      expect(input.f).toHaveBeenCalledTimes(1)
      expect(res).toStrictEqual(input.params)
    })
  })
})
