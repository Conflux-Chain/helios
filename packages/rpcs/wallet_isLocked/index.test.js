// eslint-disable-next-line no-unused-vars
import {expect, describe, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {main} from './'

describe('wallet_isLocked', function () {
  describe('main', function () {
    it('should call the db getLocked method and return the result', function () {
      const input = {
        db: {getLocked: jest.fn(() => true)},
      }

      expect(main(input)).toBe(true)
      expect(input.db.getLocked).toHaveBeenCalled()
    })
  })
})
