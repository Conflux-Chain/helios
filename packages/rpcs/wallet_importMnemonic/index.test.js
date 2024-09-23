import {expect, describe, it, vi} from 'vitest'
import {main, schemas} from './'
import {validate} from '@fluent-wallet/spec'

describe('wallet_importMnemonic', () => {
  describe('schemas', () => {
    it('should validate the input data depends on schema.input', async () => {
      expect(
        validate(schemas.input, {
          mnemonic:
            'oyster tuna little panel song print orient humor boy chaos quit street',
          password: '12345678',
        }),
      ).toBe(true)

      // invalid mnemonic
      expect(
        validate(schemas.input, {
          mnemonic:
            'oyster tuna little panel song print orient humor boy chaos quit',
          password: '12345678',
        }),
      ).toBe(false)
    })
  })

  describe('main', () => {
    const input = {
      params: {
        mnemonic:
          'oyster tuna little panel song print orient humor boy chaos quit street',
        password: '12345678',
      },
      rpcs: {wallet_addVault: vi.fn(() => 1)},
    }
    it('should call the wallet_addVault rpc with the right params', async () => {
      await main(input)
      expect(input.rpcs.wallet_addVault).toBeCalledWith(input.params)
    })
  })
})
