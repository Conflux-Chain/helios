// eslint-disable-next-line no-unused-vars
import {expect, describe, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {main, schemas} from './'
import {validate} from '@cfxjs/spec'

describe('wallet_importMnemonic', function () {
  describe('schemas', function () {
    it('should validate the input data depends on schema.input', async function () {
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

  describe('main', function () {
    const input = {
      params: {
        mnemonic:
          'oyster tuna little panel song print orient humor boy chaos quit street',
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
