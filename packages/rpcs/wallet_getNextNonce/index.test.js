import {expect, describe, test, vi} from 'vitest'
import {main} from './index.js'

describe('@fluent-wallet/wallet_get-next-nonce', () => {
  describe('main', () => {
    test('main fn logic', async () => {
      const input = {
        rpcs: {
          cfx_getNextNonce: vi.fn(a => a),
          eth_getTransactionCount: vi.fn(a => a),
        },
        params: [],
        network: {type: 'cfx', netId: 1029},
      }

      input.params = ['0x208b86e65753bba8f557ac2a8a79ba6536ab05e2']
      await main(input)
      expect(input.rpcs.cfx_getNextNonce).toHaveBeenCalledWith([
        'cfx:aajj1b1gm7k51mhzm80czcx31kwxrm2f6jxvy30mvk',
      ])
      expect(input.rpcs.eth_getTransactionCount).toHaveBeenCalledTimes(0)

      input.network.type = 'eth'
      await main(input)
      expect(input.rpcs.eth_getTransactionCount).toHaveBeenCalledWith([
        '0x208b86e65753bba8f557ac2a8a79ba6536ab05e2',
        'latest',
      ])
      expect(input.rpcs.cfx_getNextNonce).toHaveBeenCalledTimes(1)
    })
  })
})
