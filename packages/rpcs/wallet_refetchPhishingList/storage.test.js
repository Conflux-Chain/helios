// @vitest-environment node
import {beforeEach, expect, it, vi} from 'vitest'
import {loadStoredState, saveSourceState} from './storage.js'

const local = vi.hoisted(() => ({get: vi.fn(), set: vi.fn()}))
vi.mock('webextension-polyfill', () => ({default: {storage: {local}}}))
beforeEach(() => {
  local.get.mockReset()
  local.set.mockReset().mockResolvedValue(undefined)
})

it('restores the existing storage format into named service state', async () => {
  local.get.mockResolvedValue({
    'phishing.metamask': {whitelist: [], blacklist: ['BAD.test.']},
    'phishing.metamask.meta': {
      cursor: 10,
      etag: 'mm',
      fullAt: 100,
      diffAt: 200,
    },
    'phishing.fluent': {whitelist: [], blacklist: []},
    'phishing.fluent.meta': {etag: 'fluent', checkedAt: 300},
  })
  const stored = await loadStoredState()
  expect(stored.metaMask).toMatchObject({
    cursor: 10,
    etag: 'mm',
    lastFullCheckAt: 100,
    lastDiffCheckAt: 200,
  })
  expect(stored.metaMask.lists.blocklist).toEqual(new Set(['bad.test']))
  expect(stored.fluent.lastCheckAt).toBe(300)
})

it('writes lists with their cursor and skips arrays for metadata-only changes', async () => {
  const state = {
    lists: {allowlist: new Set(), blocklist: new Set(['bad.test'])},
    cursor: 10,
    etag: 'mm',
    lastFullCheckAt: 100,
    lastDiffCheckAt: 200,
  }
  const meta = {cursor: 10, etag: 'mm', fullAt: 100, diffAt: 200}
  await saveSourceState('metaMask', state, true)
  expect(local.set).toHaveBeenLastCalledWith({
    'phishing.metamask': {whitelist: [], blacklist: ['bad.test']},
    'phishing.metamask.meta': meta,
  })
  await saveSourceState('metaMask', {...state, cursor: 11}, false)
  expect(local.set).toHaveBeenLastCalledWith({
    'phishing.metamask.meta': {...meta, cursor: 11},
  })
})

it('restores the other source when one stored entry is invalid', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  local.get.mockResolvedValue({
    'phishing.metamask': {blacklist: 'invalid'},
    'phishing.fluent': {whitelist: [], blacklist: ['good.test']},
  })
  try {
    const stored = await loadStoredState()
    expect(stored.metaMask).toBeNull()
    expect(stored.fluent.lists.blocklist).toEqual(new Set(['good.test']))
  } finally {
    warn.mockRestore()
  }
})
