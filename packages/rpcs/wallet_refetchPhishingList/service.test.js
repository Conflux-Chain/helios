// @vitest-environment node
import {afterEach, beforeEach, expect, it, vi} from 'vitest'

const {feeds, storage} = vi.hoisted(() => ({
  feeds: {
    fetchMetaMaskFullList: vi.fn(),
    fetchMetaMaskDiffs: vi.fn(),
    fetchFluentFullList: vi.fn(),
  },
  storage: {loadStoredState: vi.fn(), saveSourceState: vi.fn()},
}))
vi.mock('./fetch-list.js', () => ({createListFetcher: () => feeds}))
vi.mock('./storage.js', () => storage)

const DAY = 24 * 60 * 60 * 1000
const cursor = 1795567388
const lists = (...blocked) => ({
  allowlist: new Set(),
  blocklist: new Set(blocked),
})
let service, saved, now, locked
const refresh = () => service.refreshIfDue(() => locked)
const statusOf = async origin =>
  (await service.checkCachedOrigin(origin)).status

async function restartWorker() {
  vi.resetModules()
  service = await import('./service.js')
}

beforeEach(async () => {
  now = Date.UTC(2026, 10, 25)
  locked = false
  saved = {metaMask: null, fluent: null}
  vi.spyOn(Date, 'now').mockImplementation(() => now)
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  storage.loadStoredState
    .mockReset()
    .mockImplementation(async () => structuredClone(saved))
  storage.saveSourceState
    .mockReset()
    .mockImplementation(async (source, state) => {
      saved[source] = structuredClone(state)
    })
  feeds.fetchMetaMaskFullList
    .mockReset()
    .mockResolvedValue({lists: lists('old.test'), cursor})
  feeds.fetchMetaMaskDiffs.mockReset().mockImplementation(async current => ({
    lists: current.lists,
    cursor: current.cursor,
  }))
  feeds.fetchFluentFullList.mockReset().mockResolvedValue({lists: lists()})
  await restartWorker()
})
afterEach(() => vi.restoreAllMocks())

it('queries without downloading and restores the refreshed lists after restart', async () => {
  expect(await statusOf('https://old.test')).toBe('unknown')
  expect(feeds.fetchMetaMaskFullList).not.toHaveBeenCalled()
  await refresh()
  expect(await statusOf('https://old.test')).toBe('blocklisted')
  expect(saved.metaMask.cursor).toBe(cursor)

  await restartWorker()
  locked = true
  await refresh()
  expect(await statusOf('https://old.test')).toBe('blocklisted')
  expect(feeds.fetchMetaMaskFullList).toHaveBeenCalledTimes(1)
})

it('checks Fluent daily, MetaMask diffs after five days and snapshots after thirty', async () => {
  await refresh()
  for (const fetch of Object.values(feeds)) fetch.mockClear()
  now += DAY - 1
  await refresh()
  expect(feeds.fetchFluentFullList).not.toHaveBeenCalled()
  now += 1
  await refresh()
  expect(feeds.fetchFluentFullList).toHaveBeenCalledTimes(1)
  expect(feeds.fetchMetaMaskDiffs).not.toHaveBeenCalled()
  now += 4 * DAY
  await refresh()
  expect(feeds.fetchMetaMaskDiffs).toHaveBeenCalledTimes(1)
  expect(feeds.fetchMetaMaskFullList).not.toHaveBeenCalled()
  now += 25 * DAY
  await refresh()
  expect(feeds.fetchMetaMaskFullList).toHaveBeenCalledTimes(1)
  expect(feeds.fetchMetaMaskDiffs).toHaveBeenCalledTimes(2)
})

it('applies due diffs from the old baseline when the monthly snapshot fails', async () => {
  await refresh()
  now += 30 * DAY
  feeds.fetchMetaMaskFullList.mockRejectedValueOnce(new Error('offline'))
  feeds.fetchMetaMaskDiffs.mockResolvedValueOnce({
    lists: lists('new.test'),
    cursor: cursor + 1,
  })
  await refresh()
  expect(await statusOf('https://new.test')).toBe('blocklisted')
  expect(saved.metaMask.cursor).toBe(cursor + 1)
  feeds.fetchMetaMaskFullList.mockClear()
  await refresh()
  expect(feeds.fetchMetaMaskFullList).not.toHaveBeenCalled()
})

it('keeps a saved baseline after diff failure and retries only diffs after restart', async () => {
  feeds.fetchMetaMaskDiffs.mockRejectedValueOnce(new Error('offline'))
  await refresh()
  expect(await statusOf('https://old.test')).toBe('blocklisted')
  await restartWorker()
  feeds.fetchMetaMaskFullList.mockClear()
  feeds.fetchMetaMaskDiffs.mockResolvedValueOnce({
    lists: lists(),
    cursor: cursor + 1,
  })
  await refresh()
  expect(feeds.fetchMetaMaskFullList).not.toHaveBeenCalled()
  expect(await statusOf('https://old.test')).toBe('no-match')
})

it('publishes only successful writes and stops notifying after unsubscribe', async () => {
  await refresh()
  const listener = vi.fn()
  const unsubscribe = service.subscribeToListChanges(listener)
  now += DAY
  feeds.fetchFluentFullList.mockResolvedValue({lists: lists('new.test')})
  storage.saveSourceState.mockRejectedValueOnce(new Error('disk full'))
  await refresh()
  expect(await statusOf('https://new.test')).toBe('no-match')
  expect(saved.fluent.lists.blocklist.size).toBe(0)
  expect(listener).not.toHaveBeenCalled()

  now += 15 * 60 * 1000
  await refresh()
  expect(await statusOf('https://new.test')).toBe('blocklisted')
  expect(listener).toHaveBeenCalledTimes(1)
  now += DAY
  await refresh()
  expect(listener).toHaveBeenCalledTimes(1)
  now += DAY
  feeds.fetchFluentFullList.mockResolvedValue({lists: lists('second.test')})
  await refresh()
  expect(listener).toHaveBeenCalledTimes(2)
  unsubscribe()
  now += DAY
  feeds.fetchFluentFullList.mockResolvedValue({lists: lists('another.test')})
  await refresh()
  expect(listener).toHaveBeenCalledTimes(2)
})

it('retries a failed cache read without starting a download', async () => {
  saved.fluent = {lists: lists('cached.test')}
  storage.loadStoredState.mockRejectedValueOnce(
    new Error('temporary read failure'),
  )
  expect(await statusOf('https://cached.test')).toBe('unknown')
  expect(await statusOf('https://cached.test')).toBe('blocklisted')
  expect(feeds.fetchMetaMaskFullList).not.toHaveBeenCalled()
})

it('does not download over an unread baseline and retries loading on the next call', async () => {
  saved.metaMask = {
    lists: lists('newer.test'),
    cursor: cursor + 10,
    lastFullCheckAt: now,
    lastDiffCheckAt: now,
  }
  storage.loadStoredState.mockRejectedValueOnce(
    new Error('temporary read failure'),
  )
  await refresh()
  expect(saved.metaMask.cursor).toBe(cursor + 10)
  expect(feeds.fetchMetaMaskFullList).not.toHaveBeenCalled()
  expect(feeds.fetchFluentFullList).not.toHaveBeenCalled()
  await refresh()
  expect(await statusOf('https://newer.test')).toBe('blocklisted')
  expect(saved.metaMask.cursor).toBe(cursor + 10)
})

it('publishes Fluent before a pending MetaMask diff and shares concurrent refreshes', async () => {
  await refresh()
  now += 5 * DAY
  let releaseDiff, unsubscribe
  feeds.fetchMetaMaskDiffs.mockReturnValueOnce(
    new Promise(resolve => {
      releaseDiff = resolve
    }),
  )
  feeds.fetchFluentFullList.mockResolvedValueOnce({lists: lists('new.test')})
  const notified = new Promise(resolve => {
    unsubscribe = service.subscribeToListChanges(resolve)
  })
  feeds.fetchMetaMaskDiffs.mockClear()
  const first = refresh(),
    second = refresh()
  try {
    await notified
    expect(await statusOf('https://new.test')).toBe('blocklisted')
    expect(feeds.fetchMetaMaskDiffs).toHaveBeenCalledTimes(1)
  } finally {
    releaseDiff({lists: saved.metaMask.lists, cursor})
    await Promise.all([first, second])
    unsubscribe()
  }
})

it('starts no download while locked and discards a response after relocking', async () => {
  locked = true
  await refresh()
  expect(feeds.fetchMetaMaskFullList).not.toHaveBeenCalled()
  locked = false
  feeds.fetchMetaMaskFullList.mockImplementationOnce(async () => {
    locked = true
    return {lists: lists('old.test'), cursor}
  })
  await refresh()
  expect(storage.saveSourceState).not.toHaveBeenCalled()
  expect(feeds.fetchMetaMaskDiffs).not.toHaveBeenCalled()
})
