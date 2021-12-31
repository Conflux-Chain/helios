// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {main} from './'

describe('wallet_lock', function () {
  describe('main', function () {
    it('should set locked to true in db', async function () {
      const params = {db: {setLocked: jest.fn()}}
      main(params)
      expect(params.db.setLocked).toBeCalled()
    })
  })
})
