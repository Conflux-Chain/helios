import {expect, describe, it, vi} from 'vitest'
import {schemas, main} from './'
import {validate} from '@fluent-wallet/spec'

describe('wallet_importAddress', () => {
  describe('schemas', () => {
    it('should validate the input', async () => {
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
      ).toBe(true)
      expect(
        validate(schemas.input, {
          password: '11111111',
          address: '0x8888888888888888888888888888888888888888',
        }),
      ).toBe(true)
    })
  })

  describe('main', () => {
    it('should call the wallet_addVault method', async () => {
      const input = {
        params: {
          password: '12345678',
          address: 'cfx:type.user:aarc9abycue0hhzgyrr53m6cxedgccrmmyybjgh4xg',
        },
        rpcs: {wallet_addVault: vi.fn(() => 1)},
      }

      await main(input)
      expect(input.rpcs.wallet_addVault).toHaveBeenCalledWith(input.params)
    })
  })
})
