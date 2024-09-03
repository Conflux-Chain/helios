import {expect, describe, it} from 'vitest'
import createRandomId from './'

describe('random-id', () => {
  describe('createRandomId', () => {
    it('should create a random id, and add it on subsequent call', async () => {
      const id = createRandomId()
      expect(createRandomId()).toBe(id + 1)
    })
  })
})
