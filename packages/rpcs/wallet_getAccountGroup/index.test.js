// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {main} from './'

let input
describe('wallet_getAccountGroup', function () {
  beforeEach(() => {
    input = {
      params: {},
      db: {findGroup: jest.fn(() => [1])},
      Err: {InvalidParams: s => new Error(s)},
    }
  })
  describe('main', function () {
    test('logic', () => {
      expect(main(input)).toEqual([1])
      expect(input.db.findGroup).toHaveBeenCalledWith({hidden: false})

      input.params.accountGroupId = 1
      expect(main(input)).toEqual([1])
      expect(input.db.findGroup).toHaveBeenLastCalledWith({
        groupId: 1,
        hidden: false,
      })

      input.params.includeHidden = true
      expect(main(input)).toEqual([1])
      expect(input.db.findGroup).toHaveBeenLastCalledWith({
        groupId: 1,
      })
    })
  })
})
