// eslint-disable-next-line no-unused-vars
import {expect, describe, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {validate} from '@cfxjs/spec'
import {main, schemas} from './'

describe('wallet_unlock', function () {
  describe('schema', function () {
    it('should validate the input data', async function () {
      expect(validate(schemas.input, {})).toBe(false) // password is mandatory
      expect(validate(schemas.input, {password: 'abc'})).toBe(false) // too short
      expect(validate(schemas.input, {password: '12345678'})).toBe(true)
    })
  })

  describe('main', function () {
    const input = {
      params: {password: '12345678'},
      db: {setPassword: jest.fn()},
      rpcs: {wallet_validatePassword: jest.fn(() => true)},
      Err: Error,
    }

    it('should set the password in db', async function () {
      await main(input)
      expect(input.db.setPassword).toHaveBeenCalledWith(input.params.password)
    })

    it('should throw invalid password error if the password is invalid', async function () {
      input.rpcs.wallet_validatePassword = jest.fn(() => false)
      await expect(main(input)).rejects.toThrow('Invalid password')
    })
  })
})
