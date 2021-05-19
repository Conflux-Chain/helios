// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import createRandomId from './'

describe('random-id', function () {
  describe('createRandomId', function () {
    it('should create a random id, and add it on subsequent call', async function () {
      const id = createRandomId()
      expect(createRandomId()).toBe(id + 1)
    })
  })
})
