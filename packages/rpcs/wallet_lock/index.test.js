import {expect, describe, it, vi} from 'vitest'
import {main} from './'

describe('wallet_lock', () => {
  describe('main', () => {
    it('should set locked to true in db', async () => {
      const params = {db: {setLocked: vi.fn(), findApp: jest.fn(() => [])}}
      main(params)
      expect(params.db.setLocked).toBeCalled()
    })
  })
})
