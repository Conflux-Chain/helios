// @vitest-environment node
import {afterEach, describe, expect, it, vi} from 'vitest'
import {FULL_INTERVAL, DIFF_INTERVAL, FLUENT_INTERVAL} from './list-cache.js'
import {FULL_URL, diffUrl, FLUENT_URL} from './fetch-list.js'

const storage = vi.hoisted(() => ({get: vi.fn(), set: vi.fn()}))
vi.mock('webextension-polyfill', () => ({default: {storage: {local: storage}}}))
afterEach(() => vi.restoreAllMocks())

async function loadWorkerCache() {
  vi.resetModules()
  return import('./list-cache.js')
}

const cursor = 1795567388
const full = {
  lastUpdated: cursor,
  allowlist: Array.from({length: 20}, (_, i) => `allow-${i}.test`),
  blocklist: [
    ...Array.from({length: 50000}, (_, i) => `block-${i}.test`),
    'old.test',
  ],
  fuzzylist: [],
  blocklistPaths: [],
}
const event = (url, timestamp, kind = 'blocklist', isRemoval = false) => ({
  targetList: `eth_phishing_detect_config.${kind}`,
  url,
  timestamp,
  isRemoval,
})
async function setup() {
  let time = Date.UTC(2026, 10, 25),
    locked = false
  vi.spyOn(Date, 'now').mockImplementation(() => time)
  const data = {}
  storage.get.mockReset().mockImplementation(async () => ({...data}))
  storage.set.mockReset().mockImplementation(async patch => {
    Object.assign(data, patch)
  })
  const fixture = {
    full,
    diffs: [],
    fluent: {whitelist: [], blacklist: []},
    fail: null,
  }
  const fetchFn = vi
    .spyOn(global, 'fetch')
    .mockImplementation(async ({url}) => {
      if (fixture.fail?.(url)) throw new Error('offline')
      if (url === FULL_URL)
        return fixture.full === null
          ? new Response(null, {status: 304})
          : Response.json({data: fixture.full}, {headers: {etag: '"full"'}})
      if (url === FLUENT_URL)
        return fixture.fluent === null
          ? new Response(null, {status: 304})
          : Response.json(fixture.fluent, {headers: {etag: '"local"'}})
      if (url.startsWith(diffUrl('')))
        return Response.json({data: fixture.diffs})
      throw new Error('unexpected URL')
    })
  let cache = await loadWorkerCache()
  const isLocked = () => locked
  return {
    storage,
    fetchFn,
    fixture,
    data,
    isLocked,
    restart: async () => {
      cache = await loadWorkerCache()
    },
    advance: ms => {
      time += ms
    },
    lock: v => {
      locked = v
    },
    refresh: () => cache.refreshIfDue(isLocked),
    check: (origin, signal) =>
      cache.checkPhishingOrigin(origin, isLocked, signal),
    urls: () => fetchFn.mock.calls.map(([request]) => request.url),
  }
}
describe('MetaMask full list + diffs and independent Fluent configuration', () => {
  it('bootstraps once, catches up from the full list’s server timestamp, and never transmits the origin', async () => {
    const s = await setup()
    s.fixture.diffs = [event('new.test', cursor + 1)]
    const {verdict, rechecked} = await s.check('https://new.test/private')
    expect(verdict.status).toBe('unknown')
    expect((await rechecked).status).toBe('blocklisted')
    expect(s.urls().sort()).toEqual(
      [FULL_URL, FLUENT_URL, diffUrl(cursor)].sort(),
    )
    const [request] = s.fetchFn.mock.calls.find(([r]) => r.url === FULL_URL)
    expect(request.credentials).toBe('omit')
    expect(request.referrerPolicy).toBe('no-referrer')
    expect(request.redirect).toBe('error')
    await s.restart()
    expect((await s.check('https://new.test')).verdict.status).toBe(
      'blocklisted',
    )
    expect(s.urls()).toHaveLength(3)
  })
  it('persists only the two arrays and ignores a version-only Fluent edit', async () => {
    const s = await setup()
    s.fixture.fluent = {whitelist: [], blacklist: ['BAD.test.']}
    await s.refresh()
    for (const key of ['phishing.metamask', 'phishing.fluent']) {
      expect(Object.keys(s.data[key]).sort()).toEqual([
        'blacklist',
        'whitelist',
      ])
    }
    await s.restart()
    s.advance(FLUENT_INTERVAL)
    s.fixture.fluent = {whitelist: [], blacklist: ['bad.test'], version: 9}
    s.storage.set.mockClear()
    expect(await s.refresh()).toBe(false)
    expect(s.storage.set).toHaveBeenCalledTimes(1)
    expect(Object.keys(s.storage.set.mock.calls[0][0])).toEqual([
      'phishing.fluent.meta',
    ])
    s.advance(FLUENT_INTERVAL)
    s.fixture.fluent = {whitelist: [], blacklist: ['new.test']}
    expect(await s.refresh()).toBe(true)
    expect(s.data['phishing.fluent']).toEqual({
      whitelist: [],
      blacklist: ['new.test'],
    })
  })
  it('checks only when used: Fluent after 24 hours, deltas after 5 days, full list after 30 days', async () => {
    const s = await setup()
    await s.refresh()
    s.fetchFn.mockClear()
    s.advance(24 * 60 * 60 * 1000 - 1)
    await s.refresh()
    expect(s.urls()).toEqual([])
    s.advance(1)
    s.lock(true)
    await s.refresh()
    expect(s.urls()).toEqual([])
    s.lock(false)
    s.fixture.fluent = null
    await s.refresh()
    expect(s.urls()).toEqual([FLUENT_URL])
    s.fetchFn.mockClear()
    s.advance(DIFF_INTERVAL - FLUENT_INTERVAL - 1)
    await s.refresh()
    expect(s.urls()).toEqual([FLUENT_URL])
    s.advance(1)
    s.fixture.diffs = [event('new.test', cursor + 7)]
    await s.refresh()
    expect(s.urls()).toContain(diffUrl(cursor))
    expect(s.urls()).not.toContain(FULL_URL)
    s.fetchFn.mockClear()
    await s.restart()
    s.advance(DIFF_INTERVAL)
    s.fixture.diffs = []
    await s.refresh()
    expect(s.urls()).toContain(diffUrl(cursor + 7))
    expect(s.urls()).not.toContain(FULL_URL)
    s.advance(FULL_INTERVAL - 2 * DIFF_INTERVAL)
    s.fetchFn.mockClear()
    s.fixture.full = null
    await s.refresh()
    expect(s.urls()).toContain(FULL_URL)
    const [request] = s.fetchFn.mock.calls.find(([r]) => r.url === FULL_URL)
    expect(request.headers.get('if-none-match')).toBe('"full"')
    expect(s.urls()).toContain(diffUrl(cursor + 7))
    expect((await s.check('https://new.test')).verdict.status).toBe(
      'blocklisted',
    )
  })
  it('replaces the baseline after 30 days, replaying from the new full list rather than a local clock', async () => {
    const s = await setup()
    await s.refresh()
    s.advance(FULL_INTERVAL)
    s.fixture.full = {
      ...full,
      lastUpdated: cursor + 55,
      blocklist: full.blocklist.filter(x => x !== 'old.test'),
    }
    s.fixture.diffs = [event('latest.test', cursor + 56)]
    expect(await s.refresh()).toBe(true)
    expect(s.urls()).toContain(diffUrl(cursor + 55))
    expect((await s.check('https://old.test')).verdict.status).toBe('no-match')
    expect((await s.check('https://latest.test')).verdict.status).toBe(
      'blocklisted',
    )
  })
  it('serves the verified full list when catch-up fails and retries only diffs after restart', async () => {
    const s = await setup()
    s.fixture.fail = url => url.startsWith(diffUrl(''))
    const first = await s.check('https://old.test')
    expect(first.verdict.status).toBe('unknown')
    expect((await first.rechecked).status).toBe('blocklisted')
    expect(Object.keys(s.data).sort()).toEqual([
      'phishing.fluent',
      'phishing.fluent.meta',
      'phishing.metamask',
      'phishing.metamask.meta',
    ])
    expect(s.data['phishing.metamask.meta']).toMatchObject({
      cursor,
      diffAt: null,
    })
    await s.restart()
    s.fixture.fail = null
    s.fixture.diffs = [event('old.test', cursor + 1, 'blocklist', true)]
    const afterRestart = await s.check('https://old.test')
    expect(afterRestart.verdict.status).toBe('blocklisted')
    expect((await afterRestart.rechecked).status).toBe('no-match')
    expect(s.data['phishing.metamask.meta'].cursor).toBe(cursor + 1)
    expect(s.urls().filter(u => u === FULL_URL)).toHaveLength(1)
    expect(s.urls().filter(u => u === diffUrl(cursor))).toHaveLength(2)
  })
  it('never rolls back newer local diffs when the monthly full list is older and catch-up fails', async () => {
    const s = await setup()
    s.fixture.diffs = [
      event('new.test', cursor + 10),
      event('old.test', cursor + 10, 'blocklist', true),
    ]
    await s.refresh()
    s.advance(FULL_INTERVAL)
    s.fixture.fail = url => url.startsWith(diffUrl(''))
    expect(await s.refresh()).toBe(false)
    expect(s.urls()).toContain(diffUrl(cursor + 10))
    expect(s.data['phishing.metamask.meta']).toMatchObject({
      cursor: cursor + 10,
      diffAt: null,
    })
    s.lock(true)
    await s.restart()
    expect((await s.check('https://new.test')).verdict.status).toBe(
      'blocklisted',
    )
    expect((await s.check('https://old.test')).verdict.status).toBe('no-match')
  })
  it('does not retry the big list on normal delta errors, or lose Fluent policy on MetaMask failure', async () => {
    const s = await setup()
    s.fixture.fluent = {
      whitelist: ['old.test'],
      blacklist: ['fluent-only.test'],
    }
    s.fixture.fail = u => u === FULL_URL
    await s.refresh()
    expect((await s.check('https://fluent-only.test')).verdict.status).toBe(
      'blocklisted',
    )
    expect((await s.check('https://other.test')).verdict.status).toBe('unknown')
    s.advance(DIFF_INTERVAL)
    s.fixture.fail = null
    await s.refresh()
    expect((await s.check('https://old.test')).verdict.status).toBe(
      'allowlisted',
    )
    s.fetchFn.mockClear()
    s.advance(DIFF_INTERVAL)
    s.fixture.fail = u => u.startsWith(diffUrl(''))
    await s.refresh()
    await s.refresh()
    expect(s.urls().filter(u => u === diffUrl(cursor))).toHaveLength(1)
    expect(s.urls()).not.toContain(FULL_URL)
    expect((await s.check('https://fluent-only.test')).verdict.status).toBe(
      'blocklisted',
    )
  })
  it('does not erase valid independent sources if the other config is malformed or storage fails', async () => {
    const s = await setup()
    await s.refresh()
    s.advance(DIFF_INTERVAL)
    s.fixture.fluent = {blacklist: []}
    s.fixture.diffs = [event('old.test', cursor + 1, 'blocklist', true)]
    s.storage.set.mockRejectedValueOnce(new Error('quota'))
    expect(await s.refresh()).toBe(false)
    await s.restart()
    s.lock(true)
    expect((await s.check('https://old.test')).verdict.status).toBe(
      'blocklisted',
    )
    expect((await s.check('https://other.test')).verdict.status).toBe(
      'no-match',
    )
  })
  it.each([
    ['phishing.fluent', 'https://old.test', FLUENT_URL],
    ['phishing.metamask', 'https://fluent.test', FULL_URL],
  ])(
    'restores the other source when %s is corrupt, and does not reuse the corrupt entry’s ETag',
    async (key, origin, url) => {
      const s = await setup()
      s.fixture.fluent.blacklist = ['fluent.test']
      await s.refresh()
      s.data[key] = {blacklist: 'invalid'}
      s.fetchFn.mockClear()
      await s.restart()
      const {verdict, rechecked} = await s.check(origin)
      expect(verdict.status).toBe('blocklisted')
      await rechecked
      const [request] = s.fetchFn.mock.calls.find(([r]) => r.url === url)
      expect(request.headers.has('If-None-Match')).toBe(false)
      expect(s.urls()).not.toContain(url === FULL_URL ? FLUENT_URL : FULL_URL)
    },
  )
  it('coalesces concurrent checks, immediately serves stale data, and updates only a still-pending request', async () => {
    const s = await setup()
    await s.refresh()
    const pending = new AbortController(),
      dismissed = new AbortController()
    const a = await s.check('https://new.test', pending.signal),
      b = await s.check('https://new.test', dismissed.signal)
    expect(a.verdict.status).toBe('no-match')
    dismissed.abort()
    expect(await b.rechecked).toBeNull()
    s.advance(DIFF_INTERVAL)
    let release
    s.fetchFn.mockImplementationOnce(
      () =>
        new Promise(r => {
          release = r
        }),
    )
    const refreshing = s.refresh()
    const c = await s.check('https://old.test')
    expect(c.verdict.status).toBe('blocklisted')
    release(
      Response.json({
        data: [
          event('new.test', cursor + 1),
          event('old.test', cursor + 1, 'blocklist', true),
        ],
      }),
    )
    await refreshing
    expect((await a.rechecked).status).toBe('blocklisted')
    expect((await c.rechecked).status).toBe('no-match')
    expect(s.urls().filter(u => u === diffUrl(cursor))).toHaveLength(2)
  })
  it('never starts requests while locked, and does not start the follow-up diff after relock', async () => {
    const s = await setup()
    // Both downloads can start in parallel. Keep Fluent fresh here to isolate
    // the MetaMask full-list request and its follow-up diff.
    s.data['phishing.fluent'] = {whitelist: [], blacklist: []}
    s.data['phishing.fluent.meta'] = {checkedAt: Date.now()}
    s.lock(true)
    await s.refresh()
    expect(await (await s.check('https://old.test')).rechecked).toBeNull()
    expect(s.urls()).toEqual([])
    s.lock(false)
    s.fetchFn.mockImplementationOnce(async () => {
      s.lock(true)
      return Response.json({data: full})
    })
    expect(await s.refresh()).toBe(false)
    expect(s.urls()).toEqual([FULL_URL])
    expect(s.storage.set).not.toHaveBeenCalled()
    s.lock(false)
    expect(await s.refresh()).toBe(true)
    expect(s.urls().filter(url => url === FULL_URL)).toHaveLength(2)
    expect(s.urls()).toContain(diffUrl(cursor))
  })
})

it('shares one restored list between the two standalone cache functions', async () => {
  const s = await setup()
  s.lock(true)
  s.data['phishing.fluent'] = {whitelist: [], blacklist: ['blocked.test']}
  await s.refresh()
  const {verdict, rechecked} = await s.check('https://blocked.test')
  expect(verdict.status).toBe('blocklisted')
  expect(await rechecked).toBeNull()
  expect(storage.get).toHaveBeenCalledTimes(1)
  expect(s.urls()).toEqual([])
})

it('uses conditional GETs for Fluent and does not retry a failed download', async () => {
  const s = await setup()
  s.fixture.fluent.blacklist = ['fluent.test']
  await s.refresh()
  s.advance(FLUENT_INTERVAL)
  s.fixture.fluent = null
  expect(await s.refresh()).toBe(false)
  const [request] = s.fetchFn.mock.lastCall
  expect(request.method).toBe('GET')
  expect(request.headers.get('if-none-match')).toBe('"local"')
  expect(s.data['phishing.fluent.meta']).toEqual({
    etag: '"local"',
    checkedAt: Date.now(),
  })
  s.advance(FLUENT_INTERVAL)
  s.fixture.fail = url => url === FLUENT_URL
  expect(await s.refresh()).toBe(false)
  expect((await s.check('https://fluent.test')).verdict.status).toBe(
    'blocklisted',
  )
  expect(s.urls().filter(url => url === FLUENT_URL)).toHaveLength(3)
  expect(s.urls()).toHaveLength(5)
})
