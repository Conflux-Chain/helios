import {expect, describe, it} from 'vitest'
import {validate} from '@fluent-wallet/spec'
import {schemas, main} from './'
import {randomPrivateKey, validatePrivateKey} from '@fluent-wallet/account'

describe('wallet_generatePrivateKey', () => {
  describe('schemas', () => {
    it('should be able to validate private key', async () => {
      expect(validate(schemas.input, undefined)).toBe(true)
      expect(validate(schemas.input, [])).toBe(true)
      expect(validate(schemas.output, randomPrivateKey())).toBe(true)
    })
  })

  describe('main', () => {
    it('should return a valid private key', async () => {
      expect(validatePrivateKey(await main())).toBe(true)
    })
  })
})
