// @vitest-environment node
import {expect, it, vi} from 'vitest'
import {refreshIfDue, checkPhishingOrigin} from './client.js'

const {get} = vi.hoisted(() => ({get: vi.fn()}))
vi.mock('webextension-polyfill', () => ({
  default: {storage: {local: {get}}},
}))

it('shares one restored cache between the standalone background exports', async () => {
  get.mockResolvedValue({
    'phishing.fluent': {whitelist: [], blacklist: ['blocked.test']},
  })
  const isLocked = () => true
  expect(await refreshIfDue(isLocked)).toBe(false)
  const {verdict, rechecked} = await checkPhishingOrigin(
    'https://blocked.test',
    isLocked,
  )
  expect(verdict.status).toBe('blocklisted')
  expect(await rechecked).toBeNull()
  expect(get).toHaveBeenCalledTimes(1)
})
