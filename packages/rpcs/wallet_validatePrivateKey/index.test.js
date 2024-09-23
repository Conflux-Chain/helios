import {expect, describe, test} from 'vitest'
import {main} from './index.js'

describe('wallet_validatePrivateKey', () => {
  describe('main', () => {
    test('logic', () => {
      expect(
        main({
          params: {
            privateKey:
              '0x080d44ec61d07fe49da897d44c3213606389f8329efcf9a783fa5ae97aa00768',
          },
        }),
      ).toEqual({valid: true})
      expect(
        main({
          params: {
            privateKey:
              '080d44ec61d07fe49da897d44c3213606389f8329efcf9a783fa5ae97aa00768',
          },
        }),
      ).toEqual({valid: true})
      expect(
        main({
          params: {
            privateKey:
              '0x0000000000000000000000000000000000000000000000000000000000000000',
          },
        }),
      ).toEqual({valid: false})
      expect(
        main({
          params: {
            privateKey:
              '0000000000000000000000000000000000000000000000000000000000000000',
          },
        }),
      ).toEqual({valid: false})
      expect(
        main({
          params: {
            privateKey:
              '0x0000000000000000000000000000000000000000000000000000000000000001',
          },
        }),
      ).toEqual({valid: true})
      expect(
        main({
          params: {
            privateKey:
              '0000000000000000000000000000000000000000000000000000000000000001',
          },
        }),
      ).toEqual({valid: true})
    })
  })
})
