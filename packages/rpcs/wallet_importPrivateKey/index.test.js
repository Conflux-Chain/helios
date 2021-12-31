// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {main, schemas} from './'
import {validate} from '@fluent-wallet/spec'

describe('wallet_importPrivateKey', function () {
  describe('schemas', function () {
    it('should validate the input data depends on schema.input', async function () {
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

  describe('main', function () {
    const input = {
      params: {
        privateKey:
          '0x39bdd4a2ec600e1f8bc93538ee81d59b551fc31b34e07f163112b0a6a260139a',
        password: '12345678',
      },
      rpcs: {wallet_addVault: jest.fn(() => 1)},
    }
    it('should call the wallet_addVault rpc with the right params', async function () {
      await main(input)
      expect(input.rpcs.wallet_addVault).toBeCalledWith(input.params)
    })
  })
})
