import {expect} from '@jest/globals'
import {validate} from '@cfxjs/spec'
import {schemas} from './'

describe('wallet_generatePrivateKey', function () {
  describe('schemas', function () {
    it('should be able to validate private key', async function () {
      expect(validate(schemas.input, undefined)).toBe(true)
      expect(validate(schemas.input, {})).toBe(true)
      expect(validate(schemas.input, {entropy: 'abc'})).toBe(true)
      expect(validate(schemas.input, {entropy: 123})).toBe(false)
    })
  })
})
