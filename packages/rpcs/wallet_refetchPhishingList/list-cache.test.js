// @vitest-environment node
import {describe, expect, it, vi} from 'vitest'
import {
  createListCache,
  FULL_INTERVAL,
  DIFF_INTERVAL,
  FLUENT_INTERVAL,
} from './list-cache.js'
import {createListFetcher, FULL_URL, diffUrl, FLUENT_URL} from './fetch-list.js'

const cursor = 1795567388
const full = {
  version: 2,
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
function setup() {
  let time = Date.UTC(2026, 10, 25),
    locked = false
  const data = {},
    storage = {
      get: vi.fn(async () => ({...data})),
      set: vi.fn(async patch => {
        Object.assign(data, patch)
      }),
    }
  const fixture = {
    full,
    diffs: [],
    fluent: {version: 2, whitelist: [], blacklist: []},
    fail: null,
  }
  const fetchFn = vi.fn(async url => {
    if (fixture.fail?.(url)) throw new Error('offline')
    if (url === FULL_URL)
      return fixture.full === null
        ? new Response(null, {status: 304})
        : Response.json({data: fixture.full}, {headers: {etag: '"full"'}})
    if (url === FLUENT_URL)
      return fixture.fluent === null
        ? new Response(null, {status: 304})
        : Response.json(fixture.fluent, {headers: {etag: '"local"'}})
    if (url.startsWith(diffUrl(''))) return Response.json({data: fixture.diffs})
    throw new Error('unexpected URL')
  })
  const make = () =>
    createListCache({
      storage,
      listFetcher: createListFetcher(fetchFn),
      now: () => time,
    })
  let service = make()
  const isLocked = () => locked
  return {
    storage,
    fetchFn,
    fixture,
    data,
    isLocked,
    restart: () => {
      service = make()
    },
    advance: ms => {
      time += ms
    },
    lock: v => {
      locked = v
    },
    refresh: () => service.refreshIfDue(isLocked),
    check: (origin, signal) => service.checkOrigin(origin, isLocked, signal),
    urls: () => fetchFn.mock.calls.map(([url]) => url),
  }
}
describe('MetaMask full list + diffs and independent Fluent configuration', () => {
  it('bootstraps once, catches up from the full list’s server timestamp, and never transmits the origin', async () => {
    const s = setup()
    s.fixture.diffs = [event('new.test', cursor + 1)]
    const {verdict, rechecked} = await s.check('https://new.test/private')
    expect(verdict.status).toBe('unknown')
    expect((await rechecked).status).toBe('blocklisted')
    expect(s.urls().sort()).toEqual(
      [FULL_URL, FLUENT_URL, diffUrl(cursor)].sort(),
    )
    expect(s.fetchFn).toHaveBeenCalledWith(
      FULL_URL,
      expect.objectContaining({
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        redirect: 'error',
      }),
    )
    s.restart()
    expect((await s.check('https://new.test')).verdict.status).toBe(
      'blocklisted',
    )
    expect(s.urls()).toHaveLength(3)
  })
  it('checks only when used: Fluent after 24 hours, deltas after 5 days, full list after 30 days', async () => {
    const s = setup()
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
    s.restart()
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
    expect(s.fetchFn).toHaveBeenCalledWith(
      FULL_URL,
      expect.objectContaining({headers: {'If-None-Match': '"full"'}}),
    )
    expect(s.urls()).toContain(diffUrl(cursor + 7))
    expect((await s.check('https://new.test')).verdict.status).toBe(
      'blocklisted',
    )
  })
  it('replaces the baseline after 30 days, replaying from the new full list rather than a local clock', async () => {
    const s = setup()
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
  it('stages one full response across a failed catch-up and worker restart, without activating partial data', async () => {
    const s = setup()
    s.fixture.fail = url => url.startsWith(diffUrl(''))
    await s.refresh()
    expect((await s.check('https://old.test')).verdict.status).toBe('unknown')
    s.restart()
    s.fixture.fail = null
    expect(await s.refresh()).toBe(true)
    expect(s.urls().filter(u => u === FULL_URL)).toHaveLength(1)
    expect(s.urls().filter(u => u === diffUrl(cursor))).toHaveLength(2)
  })
  it('does not retry the big list on normal delta errors, or lose Fluent policy on MetaMask failure', async () => {
    const s = setup()
    s.fixture.fluent = {
      version: 2,
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
    const s = setup()
    await s.refresh()
    s.advance(DIFF_INTERVAL)
    s.fixture.fluent = {version: 2, blacklist: []}
    s.fixture.diffs = [event('old.test', cursor + 1, 'blocklist', true)]
    s.storage.set.mockRejectedValueOnce(new Error('quota'))
    expect(await s.refresh()).toBe(false)
    s.restart()
    s.lock(true)
    expect((await s.check('https://old.test')).verdict.status).toBe(
      'blocklisted',
    )
    expect((await s.check('https://other.test')).verdict.status).toBe(
      'no-match',
    )
  })
  it('coalesces concurrent checks, immediately serves stale data, and updates only a still-pending request', async () => {
    const s = setup()
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
    const s = setup()
    s.lock(true)
    await s.refresh()
    expect(await (await s.check('https://old.test')).rechecked).toBeNull()
    expect(s.urls()).toEqual([])
    s.lock(false)
    s.fetchFn.mockImplementationOnce(async () => {
      s.lock(true)
      return Response.json({data: full})
    })
    await s.refresh()
    expect(s.urls()).not.toContain(diffUrl(cursor))
  })
})

it('uses the shared HTTP client for GETs, accepts a conditional 304 and does not retry a failed download', async () => {
  const network = vi.spyOn(global, 'fetch')
  let time = Date.UTC(2026, 10, 25)
  let fluentChecks = 0
  network.mockImplementation(async request => {
    expect(request).toBeInstanceOf(Request)
    expect(request.method).toBe('GET')
    expect(request.credentials).toBe('omit')
    expect(request.referrerPolicy).toBe('no-referrer')
    expect(request.redirect).toBe('error')
    if (request.url === FULL_URL) return Response.json({data: full})
    if (request.url === diffUrl(cursor)) return Response.json({data: []})
    expect(request.url).toBe(FLUENT_URL)
    fluentChecks++
    if (fluentChecks === 1)
      return Response.json(
        {version: 2, whitelist: [], blacklist: ['fluent.test']},
        {headers: {etag: '"v1"'}},
      )
    expect(request.headers.get('if-none-match')).toBe('"v1"')
    if (fluentChecks === 2) return new Response(null, {status: 304})
    throw new TypeError('offline')
  })
  try {
    const {storage, isLocked} = setup()
    const service = createListCache({storage, now: () => time})
    expect(await service.refreshIfDue(isLocked)).toBe(true)
    time += FLUENT_INTERVAL
    expect(await service.refreshIfDue(isLocked)).toBe(false)
    expect(storage.set.mock.lastCall[0]['phishing.fluent.v2.meta']).toEqual({
      etag: '"v1"',
      checkedAt: time,
    })
    time += FLUENT_INTERVAL
    expect(await service.refreshIfDue(isLocked)).toBe(false)
    expect(
      (await service.checkOrigin('https://fluent.test', isLocked)).verdict
        .status,
    ).toBe('blocklisted')
    expect(fluentChecks).toBe(3)
    expect(network).toHaveBeenCalledTimes(5)
  } finally {
    network.mockRestore()
  }
})
