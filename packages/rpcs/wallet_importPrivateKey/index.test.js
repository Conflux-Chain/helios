import {expect, describe, it, vi} from 'vitest'
import {main, schemas} from './'
import {validate} from '@fluent-wallet/spec'

describe('wallet_importPrivateKey', () => {
  describe('schemas', () => {
    it('should validate the input data depends on schema.input', async () => {
      expect(
        validate(schemas.input, {
          privateKey:
            '0x39bdd4a2ec600e1f8bc93538ee81d59b551fc31b34e07f163112b0a6a260139a',
          password: '12345678',
        }),
      ).toBe(true)

      // invalid private key
      expect(
        validate(schemas.input, {
          privateKey:
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          password: '12345678',
        }),
      ).toBe(false)
    })
  })

  describe('main', () => {
    const input = {
      params: {
        privateKey:
          '0x39bdd4a2ec600e1f8bc93538ee81d59b551fc31b34e07f163112b0a6a260139a',
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
