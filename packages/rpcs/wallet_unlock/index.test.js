import {expect, describe, it, vi} from 'vitest'
import {validate} from '@fluent-wallet/spec'
import {main, schemas} from './'

describe('wallet_unlock', () => {
  describe('schema', () => {
    it('should validate the input data', async () => {
      expect(validate(schemas.input, {})).toBe(false) // password is mandatory
      expect(validate(schemas.input, {password: 'abc'})).toBe(false) // too short
      expect(validate(schemas.input, {password: '12345678'})).toBe(true)
    })
  })

  describe('main', () => {
    const input = {
      params: {password: '12345678'},
      db: {
        findApp: vi.fn(() => []),
        setPassword: vi.fn(),
        getUnlockReq: vi.fn(),
      },
      rpcs: {
        wallet_discoverAccounts: vi.fn(() => Promise.resolve(true)),
        wallet_validatePassword: vi.fn(() => true),
        wallet_afterUnlock: vi.fn(() => Promise.resolve()),
      },
      Err: {InvalidParams: msg => new Error(msg)},
    }

    it('should set the password in db', async () => {
      await main(input)
      expect(input.db.setPassword).toHaveBeenCalledWith(input.params.password)
      expect(input.rpcs.wallet_afterUnlock).toHaveBeenCalled()
    })

    it('should throw invalid password error if the password is invalid', async () => {
      input.rpcs.wallet_validatePassword = vi.fn(() => false)
      await expect(main(input)).rejects.toThrow('Invalid password')
    })
  })
})
