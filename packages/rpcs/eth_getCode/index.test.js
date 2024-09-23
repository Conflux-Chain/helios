import {expect, describe, test, vi} from 'vitest'
import {main} from './'

describe('@fluent-wallet/cfx_get-next-nonce', () => {
  describe('main', () => {
    test('logic', async () => {
      const input = {f: vi.fn(a => a), params: []}
      input.params = ['0x814f4FE000Fc0E1737791D2354df7A415730E373', 'latest']
      const res = await main(input)
      expect(res).toStrictEqual(input.params)
      expect(input.f).toHaveBeenCalledTimes(1)
    })
  })
})
