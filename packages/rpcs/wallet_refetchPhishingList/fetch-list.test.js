// @vitest-environment node
import {describe, expect, it} from 'vitest'
import {
  createListFetcher,
  FULL_URL,
  applyDiffs,
  fetchJSON,
} from './fetch-list.js'

const cursor = 1795567388
const event = (url, timestamp, kind = 'blocklist', isRemoval = false) => ({
  targetList: `eth_phishing_detect_config.${kind}`,
  url,
  timestamp,
  isRemoval,
})
it('translates a Fluent response into domain lists without storage or an extension context', async () => {
  const listFetcher = createListFetcher(async () =>
    Response.json(
      {whitelist: [], blacklist: ['EXAMPLE.test.']},
      {headers: {etag: '"v1"'}},
    ),
  )
  expect(await listFetcher.fetchFluentFullList()).toEqual({
    domainLists: {allow: new Set(), block: new Set(['example.test'])},
    etag: '"v1"',
  })
})

it.each([null, {blacklist: []}, {whitelist: [], blacklist: 'not an array'}])(
  'rejects a Fluent config without two valid lists: %j',
  async config => {
    const listFetcher = createListFetcher(async () => Response.json(config))
    await expect(listFetcher.fetchFluentFullList()).rejects.toThrow(
      'Invalid phishing list size',
    )
  },
)

describe('MetaMask diff wire format', () => {
  const base = {
    domainLists: {allow: new Set(), block: new Set(['unchanged.test'])},
    cursor,
  }
  it('orders same-feed add/remove mutations, ignores stale/foreign/path records and uses a server cursor', () => {
    const next = applyDiffs(base, [
      event('unchanged.test', cursor, 'blocklist', true),
      event('x.test', cursor + 4, 'blocklist', true),
      event('x.test', cursor + 2),
      event('ok.test', cursor + 4, 'allowlist'),
      event('shared.test/only', cursor + 6, 'blocklistPaths'),
      {...event('foreign.test', cursor + 99), targetList: 'other.blocklist'},
    ])
    expect([...next.domainLists.allow]).toEqual(['ok.test'])
    expect([...next.domainLists.block]).toEqual(['unchanged.test'])
    expect(next.cursor).toBe(cursor + 6)
    expect(base.domainLists.allow.size).toBe(0)
    expect(base.cursor).toBe(cursor)
  })
  it('preserves upstream order for changes at the same timestamp without reordering the input', () => {
    const changes = Object.freeze([
      event('new.test', cursor + 2, 'blocklist', true),
      event('new.test', cursor + 1),
      event('new.test', cursor + 2),
    ])
    const next = applyDiffs(base, changes)
    expect(next.cursor).toBe(cursor + 2)
    expect(next.domainLists.block.has('new.test')).toBe(true)
    expect(base.domainLists.block.has('new.test')).toBe(false)
  })
  it('rejects malformed batches without partially changing the input', () => {
    expect(() =>
      applyDiffs(base, [
        event('new.test', cursor + 1),
        {...event('x.test', cursor + 2), isRemoval: 'false'},
      ]),
    ).toThrow()
    expect([...base.domainLists.block]).toEqual(['unchanged.test'])
    expect(applyDiffs(base, [])).toEqual(base)
  })
  it('bounds downloads and rejects HTTP errors or unsolicited 304', async () => {
    for (const res of [
      new Response(new Uint8Array(9)),
      new Response(null, {status: 503}),
      new Response(null, {status: 304}),
    ])
      await expect(fetchJSON(FULL_URL, async () => res, 8)).rejects.toThrow()
  })
})
