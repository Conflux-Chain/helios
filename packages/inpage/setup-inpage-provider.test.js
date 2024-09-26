import {expect, describe, it, vi} from 'vitest'
describe('inpage', () => {
  describe('setupProvider', () => {
    it('should setup the provider on window.conflux', async () => {
      let listener, eventName
      window.addEventListener = vi.fn((e, l) => {
        eventName = e
        listener = l
      })
      expect(window.conflux).toBe(undefined)
      await import('./index.js')
      expect(typeof listener).toBe('function')
      expect(eventName).toBe('message')
      expect(window.conflux).toBeDefined()
    })

    it('should not setup the provider on window.ethereum when already defined', async () => {
      window.ethereum = 1
      expect(window.ethereum).toBe(1)
      await import('./index.js')
      expect(window.ethereum).toBe(1)
    })
  })
})
