import {expect, describe, it, vi} from 'vitest'
import {main} from './'

describe('wallet_isLocked', () => {
  describe('main', () => {
    it('should call the db getLocked method and return the result', () => {
      const input = {
        db: {getLocked: vi.fn(() => true)},
      }

      expect(main(input)).toBe(true)
      expect(input.db.getLocked).toHaveBeenCalled()
    })
  })
})
