// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {initProvider} from './index.js'

describe('@fluent-wallet/provider-api', function () {
  describe('initProvider', function () {
    it('should return the provider', async function () {
      let arg
      const post = jest.fn(a => (arg = a))
      const provider = initProvider({subscribe: jest.fn()}, post)
      provider.request({method: 'a'})
      expect(arg.method).toBe('a')
      expect(Number.isInteger(arg.id)).toBe(true)
      provider.request({method: 'b', id: 3})
      expect(arg.method).toBe('b')
      expect(arg.id).toBe(3)
    })
  })
})
