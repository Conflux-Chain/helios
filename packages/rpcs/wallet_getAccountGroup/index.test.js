// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {main} from './'

let input
describe('wallet_getAccountGroup', function () {
  beforeEach(() => {
    input = {params: {}, db: {getAccountGroup: jest.fn(() => [1])}}
  })
  describe('main', function () {
    test('logic', () => {
      expect(main(input)).toEqual([1])
      expect(input.db.getAccountGroup).toHaveBeenCalledWith({})

      input.params.accountGroupId = 1
      expect(main(input)).toEqual([1])
      expect(input.db.getAccountGroup).toHaveBeenLastCalledWith({eid: 1})

      input.params.includeHidden = true
      expect(main(input)).toEqual([1])
      expect(input.db.getAccountGroup).toHaveBeenLastCalledWith({
        eid: 1,
        hidden: true,
      })
    })
  })
})
