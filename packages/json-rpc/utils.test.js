// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore

import {isValidRequest} from './utils.js'

describe('@cfxjs/json-rpc', function () {
  describe('utils', function () {
    describe('isValidVersionTwoRequest', function () {
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
