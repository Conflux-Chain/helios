import {expect, describe, test, vi} from 'vitest'
import {hasBalance, hasTx} from './index.js'

let params
describe('@fluent-wallet/discover-accounts', () => {
  describe('hasTx', () => {
    test('logic', async () => {
      params = {getTxCount: vi.fn(() => '0x1'), address: 'foo'}
      expect(await hasTx(params)).toBe(true)

      params = {getTxCount: vi.fn(() => '0x0'), address: 'foo'}
      expect(await hasTx(params)).toBe(false)
    })
  })

  describe('hasBalance', () => {
    test('logic', async () => {
      params = {
        getBalance: vi.fn(() => ({foo: {'0x0': '0x1'}})),
        address: 'foo',
      }
      expect(await hasBalance(params)).toBe(true)

      params = {
        getBalance: vi.fn(() => ({foo: {'0x0': '0x0'}})),
        address: 'foo',
      }
      expect(await hasBalance(params)).toBe(false)
    })
  })
})
