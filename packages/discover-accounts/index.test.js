// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {discoverAccounts, hasBalance, hasTx} from './index.js'

let params
describe('@cfxjs/discover-accounts', function () {
  describe('hasTx', function () {
    test('logic', async () => {
      params = {getTxCount: jest.fn(() => ({result: '0x1'})), address: 'foo'}
      expect(await hasTx(params)).toBe(true)

      params = {getTxCount: jest.fn(() => ({result: '0x0'})), address: 'foo'}
      expect(await hasTx(params)).toBe(false)
    })
  })

  describe('hasBalance', function () {
    test('logic', async () => {
      params = {getBalance: jest.fn(() => ({result: '0x1'})), address: 'foo'}
      expect(await hasBalance(params)).toBe(true)

      params = {getBalance: jest.fn(() => ({result: '0x0'})), address: 'foo'}
      expect(await hasBalance(params)).toBe(false)
    })
  })

  describe('discoverAccounts', function () {
    test('logic', async () => {
      const params = {
        getBalance: jest.fn(() => ({result: '0x1'})),
        getTxCount: jest.fn(() => ({result: '0x1'})),
        mnemonic:
          'error mom brown point sun magnet armor fish urge business until plastic',
        max: 2,
        onFindOne: jest.fn(),
        hdpath: `m/44'/503'/0'/0`,
      }
      await discoverAccounts(params)
      expect(params.getBalance).toHaveBeenCalledTimes(2)
      expect(params.getTxCount).toHaveBeenCalledTimes(2)
      expect(params.getBalance).toHaveBeenLastCalledWith([
        '0x8bb3720c8323cfb8fefdbdb9229872ed34ef9b57',
      ])
      expect(params.getTxCount).toHaveBeenLastCalledWith([
        '0x8bb3720c8323cfb8fefdbdb9229872ed34ef9b57',
      ])
      expect(params.onFindOne).toHaveBeenCalledTimes(2)
      expect(params.onFindOne).toHaveBeenLastCalledWith({
        address: '0x8bb3720c8323cfb8fefdbdb9229872ed34ef9b57',
        privateKey:
          '0xe77d4353a349d770b7d2f6d0f1870231f2e7a850b9b0c0a50da6b34f1db46da9',
        index: 2,
      })
    })
  })
})
