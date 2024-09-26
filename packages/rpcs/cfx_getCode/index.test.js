import {expect, describe, test, vi} from 'vitest'
import {main} from './'

describe('@fluent-wallet/cfx_get-code', () => {
  describe('main', () => {
    test('logic', async () => {
      const input = {f: vi.fn(a => a), params: []}
      input.params = [
        'cfx:aajj1b1gm7k51mhzm80czcx31kwxrm2f6jxvy30mvk',
        'latest_state',
      ]
      const res = await main(input)
      expect(res).toStrictEqual(input.params)
      expect(input.f).toHaveBeenCalledTimes(1)
    })
  })
})
