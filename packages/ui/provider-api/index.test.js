// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, vi, afterAll, afterEach, beforeAll, beforeEach} from 'vitest' // prettier-ignore
import {initProvider} from './index.js'

describe('@fluent-wallet/provider-api', () => {
  describe('initProvider', () => {
    it('should return the provider', async () => {
      let arg
      const post = vi.fn(async a => (arg = a))
      const provider = initProvider({subscribe: vi.fn()}, post)
      provider.request({method: 'a'})
      expect(arg.method).toBe('a')
      expect(Number.isInteger(arg.id)).toBe(true)
      provider.request({method: 'b', id: 3})
      expect(arg.method).toBe('b')
      expect(arg.id).toBe(3)
    })
  })
})
