import {expect, describe, it, vi, beforeEach} from 'vitest'
import {EIP6963EventNames} from './eip-6963.js'

beforeEach(async () => {
  window.ethereum = 1
})

describe('inpage', () => {
  describe('setupProvider', () => {
    it('should setup the provider on window.conflux', async () => {
      let listeners = [],
        eventNames = []
      window.addEventListener = vi.fn((e, l) => {
        eventNames.push(e)
        listeners.push(l)
      })
      expect(window.conflux).toBe(undefined)
      await import('./index.js')
      listeners.forEach(l => expect(typeof l).toBe('function'))
      expect(eventNames[0]).toBe('message')
      expect(eventNames[1]).toBe(EIP6963EventNames.Request)
      expect(window.conflux).toBeDefined()
    })
  })
  describe('setupProvider', () => {
    it('should not setup the provider on window.ethereum when already defined', async () => {
      expect(window.ethereum).toBe(1)
      await import('./index.js')
      expect(window.ethereum).toBe(1)
    })
  })
})
