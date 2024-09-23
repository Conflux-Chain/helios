import {expect, describe, test, vi, beforeEach} from 'vitest'
import {main} from './'

let input
describe('wallet_getAccountGroup', () => {
  beforeEach(() => {
    input = {
      params: {},
      db: {getAccountGroup: vi.fn(() => [1])},
      Err: {InvalidParams: s => new Error(s)},
    }
  })
  describe('main', () => {
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
      })
    })
  })
})
