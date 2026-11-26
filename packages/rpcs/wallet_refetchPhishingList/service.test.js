// @vitest-environment node
import {createHash} from 'node:crypto'
import {describe, expect, it, vi} from 'vitest'
import {createDomainService, MAX_AGE} from './service.js'
const prefix =
  'https://raw.githubusercontent.com/conflux-fans/phishing-detect/main/'
const whitelist = Array.from({length: 20}, (_, i) => `allow-${i}.test`)
const blacklist = Array.from({length: 50000}, (_, i) => `block-${i}.test`)
function publish(extra) {
  const list = JSON.stringify({
    version: 2,
    whitelist,
    blacklist: [...blacklist, extra],
  })
  return {
    list,
    stamp: {
      allowed: whitelist.length,
      blocked: blacklist.length + 1,
      domainsSha256: createHash('sha256').update(list).digest('hex'),
    },
  }
}
const first = publish('old.test'),
  second = publish('new.test')
function setup() {
  let data = {},
    time = Date.UTC(2026, 0, 1),
    live = first,
    locked = false
  const storage = {
    get: vi.fn(async () => ({...data})),
    set: vi.fn(async patch => {
      Object.assign(data, patch)
    }),
  }
  const fetchFn = vi.fn(async url => {
    if (url === prefix + 'source.json') return Response.json(live.stamp)
    if (url === prefix + 'domains.json') return new Response(live.list)
    throw new Error('Unexpected request')
  })
  const make = () => createDomainService({storage, fetchFn, now: () => time})
  const service = make(),
    isLocked = () => locked
  return {
    storage,
    fetchFn,
    make,
    service,
    isLocked,
    advance: ms => {
      time += ms
    },
    publish: v => {
      live = v
    },
    lock: v => {
      locked = v
    },
    urls: () => fetchFn.mock.calls.map(([u]) => u.slice(prefix.length)),
    check: (origin = 'https://new.test') =>
      service.checkOrigin(origin, isLocked),
    refresh: () => service.refreshIfDue(isLocked),
  }
}
describe('Fluent mirror / demand-driven updates', () => {
  it('returns unknown on first use, then a verdict for the same origin from the verified list', async () => {
    const s = setup()
    const {verdict, rechecked} = await s.check('https://old.test/private?q=1')
    expect(verdict.status).toBe('unknown')
    expect((await rechecked).status).toBe('blocklisted')
    expect(s.urls()).toEqual(['source.json', 'domains.json'])
    expect(s.fetchFn).toHaveBeenCalledWith(
      prefix + 'source.json',
      expect.objectContaining({
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        redirect: 'error',
      }),
    )
    expect(s.storage.set).toHaveBeenCalledTimes(1)
  })
  it('starts no timer and does not fetch while locked; unlock checks due stamps, not every unlock', async () => {
    const s = setup()
    s.lock(true)
    expect(await s.refresh()).toBe(false)
    expect(await (await s.check()).rechecked).toBeNull()
    expect(s.urls()).toEqual([])
    s.lock(false)
    await s.refresh()
    s.advance(MAX_AGE - 1)
    await s.refresh()
    expect(s.urls()).toHaveLength(2)
    s.lock(true)
    s.advance(2)
    await s.refresh()
    expect(s.urls()).toHaveLength(2)
    s.lock(false)
    await s.refresh()
    expect(s.urls()).toEqual(['source.json', 'domains.json', 'source.json'])
    s.advance(MAX_AGE - 1)
    await s.refresh()
    expect(s.urls()).toHaveLength(3)
  })
  it('serves stale data immediately; overlapping unlock and domain checks share one download and recheck each origin', async () => {
    const s = setup()
    await s.refresh()
    s.advance(MAX_AGE)
    s.publish(second)
    let release
    const wait = new Promise(r => {
      release = r
    })
    s.fetchFn.mockImplementationOnce(async () => {
      await wait
      return Response.json(second.stamp)
    })
    const change = s.refresh()
    const a = await s.check('https://old.test'),
      b = await s.check('https://new.test')
    expect(a.verdict.status).toBe('blocklisted')
    expect(b.verdict.status).toBe('no-match')
    expect(s.urls()).toHaveLength(3)
    release()
    expect(await change).toBe(true)
    expect((await a.rechecked).status).toBe('no-match')
    expect((await b.rechecked).status).toBe('blocklisted')
    expect(s.urls()).toHaveLength(4)
  })
  it('rechecks a still-pending fresh lookup on the next publication, not a cancelled request', async () => {
    const s = setup()
    await s.refresh()
    const pending = new AbortController(),
      dismissed = new AbortController()
    const a = await s.service.checkOrigin(
      'https://new.test',
      s.isLocked,
      pending.signal,
    )
    const b = await s.service.checkOrigin(
      'https://new.test',
      s.isLocked,
      dismissed.signal,
    )
    expect(a.verdict.status).toBe('no-match')
    expect(s.urls()).toHaveLength(2)
    dismissed.abort()
    expect(await b.rechecked).toBeNull()
    // An unchanged stamp is not a new publication.
    s.advance(MAX_AGE)
    expect(await s.refresh()).toBe(false)
    s.advance(MAX_AGE)
    s.publish(second)
    expect(await s.refresh()).toBe(true)
    expect((await a.rechecked).status).toBe('blocklisted')
    expect(s.urls()).toEqual([
      'source.json',
      'domains.json',
      'source.json',
      'source.json',
      'domains.json',
    ])
  })
  it('uses the persisted success time across worker restarts; an unchanged digest downloads nothing else', async () => {
    const s = setup()
    await s.refresh()
    const svc = s.make()
    const a = await svc.checkOrigin('https://old.test', s.isLocked)
    expect(a.verdict.status).toBe('blocklisted')
    expect(await a.rechecked).toBeNull()
    expect(s.urls()).toHaveLength(2)
    s.advance(MAX_AGE)
    expect(await svc.refreshIfDue(s.isLocked)).toBe(false)
    expect(s.urls()).toHaveLength(3)
    expect(Object.keys(s.storage.set.mock.lastCall[0])).toEqual([
      'phishing.fluentCheck.v1',
    ])
    await s.make().refreshIfDue(s.isLocked)
    expect(s.urls()).toHaveLength(3)
  })
  it.each([
    'offline',
    'status',
    'stamp',
    'digest',
    'counts',
    'schema',
    'quota',
    'oversize',
  ])(
    'retains the last good pair and throttles retries after %s',
    async mode => {
      const s = setup()
      await s.refresh()
      s.advance(MAX_AGE)
      s.publish(second)
      if (mode === 'offline')
        s.fetchFn.mockRejectedValueOnce(new Error('offline'))
      if (mode === 'status')
        s.fetchFn.mockResolvedValueOnce(new Response(null, {status: 503}))
      if (mode === 'stamp')
        s.fetchFn.mockResolvedValueOnce(Response.json({domainsSha256: 'bad'}))
      if (mode === 'digest') s.publish({...first, stamp: second.stamp})
      if (mode === 'counts')
        s.publish({...second, stamp: {...second.stamp, allowed: 1}})
      if (mode === 'schema') {
        const list = JSON.stringify({version: 3})
        s.publish({
          list,
          stamp: {
            ...second.stamp,
            domainsSha256: createHash('sha256').update(list).digest('hex'),
          },
        })
      }
      if (mode === 'quota')
        s.storage.set.mockRejectedValueOnce(new Error('quota'))
      if (mode === 'oversize')
        s.fetchFn.mockResolvedValueOnce(new Response(new Uint8Array(8193)))
      const old = await s.check('https://old.test')
      expect(old.verdict.status).toBe('blocklisted')
      expect(await old.rechecked).toBeNull()
      const calls = s.urls().length
      await s.refresh()
      expect(s.urls()).toHaveLength(calls)
      s.publish(second)
      s.advance(61000)
      expect(await s.refresh()).toBe(true)
    },
  )
  it('does not download the large list when the wallet relocks during the stamp request', async () => {
    const s = setup()
    await s.refresh()
    s.advance(MAX_AGE)
    s.fetchFn.mockImplementationOnce(async () => {
      s.lock(true)
      return Response.json(second.stamp)
    })
    expect(await s.refresh()).toBe(false)
    expect(s.urls()).toEqual(['source.json', 'domains.json', 'source.json'])
    expect(s.storage.set).toHaveBeenCalledTimes(1)
  })
  it('discards inconsistent storage and recovers on next unlocked check', async () => {
    const s = setup()
    await s.refresh()
    s.storage.get.mockResolvedValueOnce({
      'phishing.fluentDomains.v1': 'bad',
      'phishing.fluentCheck.v1': {hash: first.stamp.domainsSha256},
    })
    const {verdict, rechecked} = await s
      .make()
      .checkOrigin('https://old.test', s.isLocked)
    expect(verdict.status).toBe('unknown')
    expect((await rechecked).status).toBe('blocklisted')
  })
})
