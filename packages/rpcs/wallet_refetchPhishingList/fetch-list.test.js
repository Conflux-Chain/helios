// @vitest-environment node
import {expect, it, vi} from 'vitest'
import {createListFetcher} from './fetch-list.js'

it('translates a Fluent response into domain lists without storage or an extension context', async () => {
  const listFetcher = createListFetcher(async () =>
    Response.json(
      {whitelist: [], blacklist: ['EXAMPLE.test.']},
      {headers: {etag: '"v1"'}},
    ),
  )
  expect(await listFetcher.fetchFluentFullList()).toEqual({
    lists: {allowlist: new Set(), blocklist: new Set(['example.test'])},
    etag: '"v1"',
  })
})

it.each([null, {blacklist: []}, {whitelist: [], blacklist: 'not an array'}])(
  'rejects a Fluent config without two valid lists: %j',
  async config => {
    const listFetcher = createListFetcher(async () => Response.json(config))
    await expect(listFetcher.fetchFluentFullList()).rejects.toThrow(
      'Expected an array of domains',
    )
  },
)

it.each([503, 304])(
  'rejects an unexpected HTTP %s without a cache validator',
  async status => {
    const fetcher = createListFetcher(async () => new Response(null, {status}))
    await expect(fetcher.fetchFluentFullList()).rejects.toThrow(
      `List request failed: ${status}`,
    )
  },
)

it('propagates JSON parse errors rather than treating a broken response as an empty list', async () => {
  const fetcher = createListFetcher(async () => new Response('{'))
  await expect(fetcher.fetchFluentFullList()).rejects.toThrow(SyntaxError)
})

it('accepts HTTP 304 only with the supplied cache validator', async () => {
  const fetch = vi.fn(async () => new Response(null, {status: 304}))
  const client = createListFetcher(fetch)
  expect(await client.fetchFluentFullList('"cached"')).toBeNull()
  expect(fetch).toHaveBeenCalledWith(expect.any(String), {
    headers: {'If-None-Match': '"cached"'},
  })
})

it('requests diffs from the server cursor and applies them to the current list', async () => {
  const fetch = vi.fn(async () =>
    Response.json({
      data: [
        {
          targetList: 'eth_phishing_detect_config.blocklist',
          url: 'bad.test',
          timestamp: 11,
        },
      ],
    }),
  )
  const client = createListFetcher(fetch)
  const updated = await client.fetchMetaMaskDiffs({
    lists: {allowlist: new Set(), blocklist: new Set()},
    cursor: 10,
  })
  expect(fetch).toHaveBeenCalledWith(
    'https://phishing-detection.api.cx.metamask.io/v2/diffsSince/10',
  )
  expect(updated.cursor).toBe(11)
  expect(updated.lists.blocklist).toEqual(new Set(['bad.test']))
})
