import {expect, describe, test} from 'vitest'
import {isValidRequest} from './utils.js'

describe('@fluent-wallet/json-rpc', () => {
  describe('utils', () => {
    describe('isValidVersionTwoRequest', () => {
      test('should able to validate rpc requests', () => {
        expect(isValidRequest([])).toBeFalsy()
        expect(isValidRequest({})).toBeFalsy()
        expect(isValidRequest({jsonrpc: '2.0'})).toBeFalsy()
        expect(isValidRequest({jsonrpc: '2.0', method: 1})).toBeFalsy()
        expect(isValidRequest({jsonrpc: '2.0', method: 'foo'})).toBeTruthy()
        expect(
          isValidRequest({jsonrpc: '2.0', method: 'foo', params: null}),
        ).toBeFalsy()
        expect(
          isValidRequest({jsonrpc: '2.0', method: 'foo', params: {}}),
        ).toBeTruthy()
        expect(
          isValidRequest({jsonrpc: '2.0', method: 'foo', params: []}),
        ).toBeTruthy()
        expect(
          isValidRequest({jsonrpc: '2.0', method: 'foo', params: [], id: 1n}),
        ).toBeFalsy()
        expect(
          isValidRequest({jsonrpc: '2.0', method: 'foo', params: [], id: 1}),
        ).toBeTruthy()
      })
    })
  })
})
