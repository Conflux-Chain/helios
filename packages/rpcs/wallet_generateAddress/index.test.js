// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {main} from './'
import {
  validate,
  ethHexAddress,
  hexUserAddress,
  cfxHexAddress,
  hexBuiltInAddress,
  hexContractAddress,
  hexNullAddress,
  base32BuiltinAddress,
  base32ContractAddress,
  base32UserAddress,
} from '@cfxjs/spec'

describe('wallet_generateAddress', function () {
  describe('main', function () {
    it('should generate the correct address', async function () {
      expect(validate(ethHexAddress, main({params: {eth: true}}))).toBe(true)
      expect(validate(cfxHexAddress, main({params: {hex: true}}))).toBe(true)
      expect(
        validate(hexUserAddress, main({params: {hex: true, type: 'user'}})),
      ).toBe(true)
      expect(
        validate(
          hexContractAddress,
          main({params: {hex: true, type: 'contract'}}),
        ),
      ).toBe(true)
      expect(
        validate(
          hexBuiltInAddress,
          main({params: {hex: true, type: 'builtin'}}),
        ),
      ).toBe(true)
      expect(
        validate(hexNullAddress, main({params: {hex: true, type: 'null'}})),
      ).toBe(true)
      expect(
        validate(
          [base32UserAddress, {netId: 1029}],
          main({params: {base32: true, type: 'user', networkId: 1029}}),
        ),
      ).toBe(true)
      expect(
        validate(
          [base32UserAddress, {netId: 1}],
          main({params: {base32: true, type: 'user', networkId: 1}}),
        ),
      ).toBe(true)
      expect(
        validate(
          [base32BuiltinAddress, {netId: 13}],
          main({params: {base32: true, type: 'builtin', networkId: 13}}),
        ),
      ).toBe(true)
      expect(
        validate(
          [base32ContractAddress, {netId: 1003}],
          main({params: {base32: true, type: 'contract', networkId: 1003}}),
        ),
      ).toBe(true)
    })
  })
})
