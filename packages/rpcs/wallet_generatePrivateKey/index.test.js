// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {validate} from '@fluent-wallet/spec'
import {schemas, main} from './'
import {randomPrivateKey, validatePrivateKey} from '@fluent-wallet/account'

describe('wallet_generatePrivateKey', function () {
  describe('schemas', function () {
    it('should be able to validate private key', async function () {
      expect(validate(schemas.input, undefined)).toBe(true)
      expect(validate(schemas.input, [])).toBe(true)
      expect(validate(schemas.output, randomPrivateKey())).toBe(true)
    })
  })

  describe('main', function () {
    it('should return a valid private key', async function () {
      expect(validatePrivateKey(await main())).toBe(true)
    })
  })
})
