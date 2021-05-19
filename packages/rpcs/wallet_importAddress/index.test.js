// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {schemas, main} from './'
import {validate} from '@cfxjs/spec'

describe('wallet_importAddress', function () {
  describe('schemas', function () {
    it('should validate the input', async function () {
      expect(
        validate(schemas.input, {
          password: '11111111',
          address: 'CFX:TYPE.USER:AARC9ABYCUE0HHZGYRR53M6CXEDGCCRMMYYBJGH4XG',
        }),
      ).toBe(true)
      expect(
        validate(schemas.input, {
          password: '11111111',
          address:
            'CFXTEST:TYPE.USER:AARC9ABYCUE0HHZGYRR53M6CXEDGCCRMMY8M50BU1P',
        }),
      ).toBe(true)
      expect(
        validate(schemas.input, {
          password: '11111111',
          address: 'cfxtest:aarc9abycue0hhzgyrr53m6cxedgccrmmy8m50bu1p',
        }),
      ).toBe(true)
      expect(
        validate(schemas.input, {
          password: '11111111',
          address: '0x1111111111111111111111111111111111111111',
        }),
      ).toBe(true)

      // password too short
      expect(
        validate(schemas.input, {
          password: '11111',
          address: '0x1111111111111111111111111111111111111111',
        }),
      ).toBe(false)

      // only account address
      expect(
        validate(schemas.input, {
          password: '11111111',
          address:
            'CFX:TYPE.BUILTIN:AAAG4WT2MBMBB44SP6SZD783RY0JTAD5BEAAR3K429',
        }),
      ).toBe(false)
      expect(
        validate(schemas.input, {
          password: '11111111',
          address:
            'CFX:TYPE.CONTRACT:ACAG4WT2MBMBB44SP6SZD783RY0JTAD5BEX25T8VC9',
        }),
      ).toBe(false)
      expect(
        validate(schemas.input, {
          password: '11111111',
          address: '0x0000000000000000000000000000000000000000',
        }),
      ).toBe(false)
      expect(
        validate(schemas.input, {
          password: '11111111',
          address: '0x8888888888888888888888888888888888888888',
        }),
      ).toBe(false)

      // only mainnet and testnet base32address
      expect(
        validate(schemas.input, {
          password: '11111111',
          address: 'net10086:aaag4wt2mbmbb44sp6szd783ry0jtad5benr1ap5gp',
        }),
      ).toBe(false)
    })
  })

  describe('main', function () {
    it('should call the wallet_addVault method', async function () {
      const input = {
        params: {
          password: '12345678',
          address: 'CFX:TYPE.USER:AARC9ABYCUE0HHZGYRR53M6CXEDGCCRMMYYBJGH4XG',
        },
        rpcs: {wallet_addVault: jest.fn(() => 1)},
      }

      await main(input)
      expect(input.rpcs.wallet_addVault).toHaveBeenCalledWith(input.params)
    })
  })
})
