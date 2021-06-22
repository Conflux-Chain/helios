// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {main, schemas} from './'
import {encrypt} from 'browser-passworder'
import {validate} from '@cfxjs/spec'

let input

describe('@cfxjs/wallet_add-vault', function () {
  describe('schemas', function () {
    describe('input', function () {
      it('should return false with invalid data', async function () {
        expect(
          validate(schemas.input, {
            password: '12345678',
            mnemonic:
              'chest nasty rude robot holiday indicate pride tooth number palace strategy fiction',
            privateKey:
              '85f99f8b29a256ac93bc61899f8ba139864e1b39afbc947bdaee192c683d0205',
          }),
        ).toBe(false)
      })

      it('should return true with valid data', async function () {
        expect(
          validate(schemas.input, {
            password: '12345678',
            mnemonic:
              'chest nasty rude robot holiday indicate pride tooth number palace strategy fiction',
          }),
        ).toBe(true)

        expect(
          validate(schemas.input, {
            password: '12345678',
            privateKey:
              '85f99f8b29a256ac93bc61899f8ba139864e1b39afbc947bdaee192c683d0205',
          }),
        ).toBe(true)

        expect(
          validate(schemas.input, {
            password: '12345678',
            address: 'cfxtest:aajzvxnvv0cj6f6paa9skdafxm9jytbybpka95hm1m',
          }),
        ).toBe(true)
      })
    })
  })

  describe('main', function () {
    beforeEach(function () {
      input = {
        Err: {InvalidParams: jest.fn(msg => new Error(msg))},
        db: {
          t: jest.fn(() => ({tempids: {'-1': 2}})),
          getNetwork: jest.fn(() => [
            {type: 'cfx', netId: 1029},
            {type: 'eth', netId: 1},
          ]),
          createVault: jest.fn(() => 1),
          getAccountGroup: jest.fn(() => [{eid: 2}]),
          getVault: jest.fn(() => [{}]),
        },
        rpcs: {
          wallet_validatePassword: jest.fn(() => true),
        },
        params: {password: '11111111', mnemonic: 'abc'},
      }
    })

    it('should throw invalid password error with invalid password', async function () {
      input.rpcs.wallet_validatePassword = jest.fn(() => false)
      await expect(main(input)).rejects.toThrow(
        input.Err.InvalidParams('Invalid password'),
      )
      expect(input.rpcs.wallet_validatePassword).toBeCalledWith({
        password: input.params.password,
      })
    })

    it('should throw duplicate credentials error with duplicate credentials', async function () {
      const encrypted = {
        type: 'hd',
        data: await encrypt(input.params.password, input.params.mnemonic),
      }
      input.db.getVault = () => [encrypted]
      await expect(main(input)).rejects.toThrow(
        'Duplicate credential with account group 2',
      )
    })
  })
})
