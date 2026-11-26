import {expect, it, vi} from 'vitest'
import {walletRefetchPhishingList} from './background.js'

const {refreshIfDue} = vi.hoisted(() => ({refreshIfDue: vi.fn()}))
vi.mock('./service.js', () => ({createDomainService: () => ({refreshIfDue})}))

it('dispatches an internal, non-blocking refresh with the live wallet lock getter', () => {
  const getLocked = () => false
  refreshIfDue.mockReturnValue(new Promise(() => {}))
  expect(walletRefetchPhishingList.NAME).toBe('wallet_refetchPhishingList')
  expect(walletRefetchPhishingList.permissions).toEqual({
    external: [],
    db: ['getLocked'],
  })
  expect(walletRefetchPhishingList.main({db: {getLocked}})).toBeUndefined()
  expect(refreshIfDue).toHaveBeenCalledWith(getLocked)
})
