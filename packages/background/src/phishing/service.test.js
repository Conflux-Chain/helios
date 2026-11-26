// @vitest-environment node
import {describe, expect, it, vi} from 'vitest'
import {createDomainService, downloadFeed, FEED_URL} from './service.js'

// Match the production completeness checks without depending on live websites.
const allow = Array.from({length: 20}, (_, i) => `allowed-${i}.test`)
const block = Array.from({length: 50000}, (_, i) => `blocked-${i}.test`)
const bundled = {
  version: 2,
  whitelist: allow,
  blacklist: [...block, 'original.test'],
}
const updated = {
  version: 2,
  whitelist: [...allow, 'original.test'],
  blacklist: [...block, 'new.test'],
}

function setup() {
  let data = {}
  const storage = {
    get: vi.fn(async () => data),
    set: vi.fn(async value => {
      data = value
    }),
  }
  const loadBundled = vi.fn(async () => bundled)
  const download = vi.fn(async () => ({feed: updated, etag: '"next"'}))
  const make = () => createDomainService({storage, loadBundled, download})
  return {service: make(), restart: make, storage, loadBundled, download}
}

describe('background list lifecycle', () => {
  it('uses the packaged copy offline and never sends the origin to a server', async () => {
    const {service, download} = setup()
    expect(await service.checkOrigin('https://original.test')).toMatchObject({
      status: 'blocklisted',
    })
    expect(download).not.toHaveBeenCalled()
  })

  it('updates both lists in one write, restores them after restart and revalidates with ETag', async () => {
    const {service, storage, loadBundled, restart, download} = setup()
    expect(await service.refresh()).toBe('updated')
    expect(storage.set).toHaveBeenCalledTimes(1)
    const restored = restart()
    expect(await restored.checkOrigin('https://original.test')).toMatchObject({
      status: 'allowlisted',
    })
    expect(await restored.checkOrigin('https://new.test')).toMatchObject({
      status: 'blocklisted',
    })
    expect(loadBundled).toHaveBeenCalledTimes(1)
    download.mockResolvedValueOnce(null)
    expect(await restored.refresh()).toBe('unchanged')
    expect(download).toHaveBeenLastCalledWith('"next"')
    expect(storage.set).toHaveBeenCalledTimes(1)
  })

  it('keeps serving the last valid pair across failures and worker restarts', async () => {
    const {service, download, storage, restart} = setup()
    await service.refresh()
    download
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({feed: {...bundled, version: 3}})
      .mockResolvedValueOnce({feed: {...bundled, whitelist: []}})
      .mockResolvedValueOnce({feed: {...bundled, blacklist: ['only.test']}})
      .mockResolvedValueOnce({feed: {...bundled, blacklist: [...block, {}]}})
    for (let i = 0; i < 5; i++)
      expect(await service.refresh()).toBe('unavailable')
    expect(storage.set).toHaveBeenCalledTimes(1)
    storage.set.mockRejectedValueOnce(new Error('quota exceeded'))
    download.mockResolvedValueOnce({feed: bundled, etag: '"different"'})
    expect(await service.refresh()).toBe('unavailable')
    for (const svc of [service, restart()])
      expect(await svc.checkOrigin('https://original.test')).toMatchObject({
        status: 'allowlisted',
      })
  })

  it('discards corrupt storage, deduplicates refreshes and serves during download', async () => {
    const {service, storage, loadBundled, download} = setup()
    storage.get.mockResolvedValueOnce({
      'phishing.metaMaskDomains.v1': {feed: {version: 0}},
    })
    let finish
    download.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          finish = resolve
        }),
    )
    const first = service.refresh()
    expect(service.refresh()).toBe(first)
    expect(await service.checkOrigin('https://original.test')).toMatchObject({
      status: 'blocklisted',
    })
    expect(loadBundled).toHaveBeenCalledTimes(1)
    finish({feed: updated, etag: '"next"'})
    expect(await first).toBe('updated')
  })

  it('rejects a partial update even when it satisfies the absolute minimum', async () => {
    const {service, download, storage} = setup()
    download.mockResolvedValueOnce({
      feed: {
        ...updated,
        whitelist: Array.from({length: 50}, (_, i) => `allow-${i}.test`),
      },
    })
    expect(await service.refresh()).toBe('updated')
    download.mockResolvedValueOnce({feed: bundled})
    expect(await service.refresh()).toBe('unavailable')
    expect(storage.set).toHaveBeenCalledTimes(1)
  })

  it('does not label an unavailable detector as a clean result', async () => {
    const {service, loadBundled} = setup()
    loadBundled.mockRejectedValue(new Error('unavailable'))
    expect(await service.checkOrigin('https://example.test')).toEqual({
      status: 'unknown',
    })
    expect(await service.refresh()).toBe('updated')
    expect(await service.checkOrigin('https://new.test')).toMatchObject({
      status: 'blocklisted',
    })
  })
})

describe('list transport', () => {
  it('downloads only the list, omitting credentials and referrer, and supports 304', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({version: 2}), {headers: {etag: '"x"'}}),
      )
      .mockResolvedValueOnce(new Response(null, {status: 304}))
    expect(await downloadFeed(FEED_URL, fetchFn)).toEqual({
      feed: {version: 2},
      etag: '"x"',
    })
    expect(await downloadFeed(FEED_URL, fetchFn, '"x"')).toBeNull()
    expect(fetchFn).toHaveBeenLastCalledWith(
      FEED_URL,
      expect.objectContaining({
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        redirect: 'error',
        headers: {'If-None-Match': '"x"'},
      }),
    )
  })
  it.each([
    () => new Response('bad json'),
    () => new Response(null, {status: 503}),
    () => new Response(null, {status: 304}),
    () =>
      new Response('{}', {
        headers: {'content-length': String(13 * 1024 * 1024)},
      }),
    () => new Response(new Uint8Array(12 * 1024 * 1024 + 1)),
  ])('rejects invalid and oversized responses', async response => {
    await expect(
      downloadFeed(FEED_URL, async () => response()),
    ).rejects.toThrow()
  })
})
