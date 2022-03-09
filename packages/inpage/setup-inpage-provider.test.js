// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore

describe('inpage', function () {
  describe('setupProvider', function () {
    it('should setup the provider on window.cfx', async function () {
      let listener, eventName
      window.addEventListener = jest.fn((e, l) => {
        eventName = e
        listener = l
      })
      // expect(window.conflux).toBe(undefined)
      await import('./index.js')
      expect(typeof listener).toBe('function')
      expect(eventName).toBe('message')
      // expect(window.conflux).toBeDefined()
    })
  })
})
