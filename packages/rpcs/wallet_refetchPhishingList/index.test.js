import {expect, it, vi} from 'vitest'
import {validate} from '@fluent-wallet/spec'
import {NAME, schemas, permissions, main} from './index.js'
import {refreshIfDue} from './service.js'

vi.mock('./service.js', () => ({refreshIfDue: vi.fn()}))

it('registers a no-argument internal RPC with only the live lock getter', () => {
  expect(NAME).toBe('wallet_refetchPhishingList')
  expect(permissions).toEqual({external: [], db: ['getLocked']})
  expect(validate(schemas.input, undefined)).toBe(true)
})

it('returns after dispatch without waiting for the refresh to finish', async () => {
  const getLocked = () => false
  refreshIfDue.mockReturnValue(new Promise(() => {}))
  await expect(main({db: {getLocked}})).resolves.toBeUndefined()
  expect(refreshIfDue).toHaveBeenCalledExactlyOnceWith(getLocked)
})
