// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {hasBalance, hasTx} from './index.js'

let params
describe('@fluent-wallet/discover-accounts', function () {
  describe('hasTx', function () {
    test('logic', async () => {
      params = {getTxCount: jest.fn(() => '0x1'), address: 'foo'}
      expect(await hasTx(params)).toBe(true)

      params = {getTxCount: jest.fn(() => '0x0'), address: 'foo'}
      expect(await hasTx(params)).toBe(false)
    })
  })

  describe('hasBalance', function () {
    test('logic', async () => {
      params = {
        getBalance: jest.fn(() => ({foo: {'0x0': '0x1'}})),
        address: 'foo',
      }
      expect(await hasBalance(params)).toBe(true)

      params = {
        getBalance: jest.fn(() => ({foo: {'0x0': '0x0'}})),
        address: 'foo',
      }
      expect(await hasBalance(params)).toBe(false)
    })
  })
})
