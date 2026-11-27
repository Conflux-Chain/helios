import {initFetcher} from '@fluent-wallet/fetch-rpc'
import {normalizeDomainLists, normalizeDomain} from './domain.js'

// MetaMask/core phishing-controller: v1 full list plus ordered v2 mutations.
const METAMASK_API = 'https://phishing-detection.api.cx.metamask.io'
const LIST_PREFIX = 'eth_phishing_detect_config.'
const ALLOW_LIST = `${LIST_PREFIX}allowlist`
const BLOCK_LIST = `${LIST_PREFIX}blocklist`
export const FULL_URL = `${METAMASK_API}/v1/stalelist`
export const diffUrl = cursor => `${METAMASK_API}/v2/diffsSince/${cursor}`
export const FLUENT_URL =
  'https://cdn.jsdelivr.net/gh/conflux-fans/phishing-detect@main/config.json'
export const validCursor = n => Number.isSafeInteger(n) && n > 0
function parseMetamaskFullList(payload) {
  const data = payload?.data
  if (!validCursor(data?.lastUpdated))
    throw new Error('Invalid MetaMask full list')
  const domainLists = normalizeDomainLists({
    whitelist: data.allowlist,
    blacklist: data.blocklist,
  })
  return {domainLists, cursor: data.lastUpdated}
}
function parseFluentFullList(payload) {
  return {domainLists: normalizeDomainLists(payload)}
}

export function applyDiffs(base, diffs) {
  if (!Array.isArray(diffs)) throw new Error('Invalid MetaMask diffs')
  // The cursor is the last upstream event time (seconds), not the local
  // fetch time. Compare every row with the starting cursor: ties are valid.
  let cursor = base.cursor
  const changes = []
  for (const row of diffs) {
    if (
      !validCursor(row?.timestamp) ||
      typeof row.targetList !== 'string' ||
      typeof row.url !== 'string' ||
      (row.isRemoval !== undefined && typeof row.isRemoval !== 'boolean')
    )
      throw new Error('Invalid MetaMask diff')
    if (row.timestamp <= base.cursor || !row.targetList.startsWith(LIST_PREFIX))
      continue
    // Other MetaMask entries advance the cursor but never become host matches.
    cursor = Math.max(cursor, row.timestamp)
    if (row.targetList === ALLOW_LIST || row.targetList === BLOCK_LIST)
      changes.push(row)
  }

  // Sort the filtered copy (stable for ties). Copy each active set only if it changes.
  changes.sort((a, b) => a.timestamp - b.timestamp)
  let domainLists = base.domainLists
  for (const {url, targetList, isRemoval: remove} of changes) {
    const host = normalizeDomain(url)
    if (!host) continue
    const key = targetList === ALLOW_LIST ? 'allow' : 'block'
    const exists = domainLists[key].has(host)
    if ((remove && !exists) || (!remove && exists)) continue
    if (domainLists === base.domainLists) domainLists = {...domainLists}
    if (domainLists[key] === base.domainLists[key])
      domainLists[key] = new Set(domainLists[key])
    if (remove) domainLists[key].delete(host)
    else domainLists[key].add(host)
  }
  return {domainLists, cursor}
}

// Read the body only on 200; 304 means the cached list still applies.
export function createListFetcher(
  fetcher = initFetcher({
    retry: 0,
    timeout: 30_000,
    throwHttpErrors: false,
    cache: 'no-cache',
    redirect: 'error',
    referrerPolicy: 'no-referrer',
  }),
) {
  async function fetchFullList(url, etag, parse) {
    const response = await fetcher(url, {
      headers: etag ? {'If-None-Match': etag} : {},
    })
    if (etag && response.status === 304) return null
    if (response.status !== 200)
      throw new Error(`List request failed: ${response.status}`)
    return {...parse(await response.json()), etag: response.headers.get('etag')}
  }
  return {
    fetchMetamaskFullList: etag =>
      fetchFullList(FULL_URL, etag, parseMetamaskFullList),
    fetchFluentFullList: etag =>
      fetchFullList(FLUENT_URL, etag, parseFluentFullList),
    async fetchMetamaskDiffs(baseline) {
      const response = await fetcher(diffUrl(baseline.cursor))
      if (response.status !== 200)
        throw new Error(`Diff request failed: ${response.status}`)
      const {data} = await response.json()
      return applyDiffs(baseline, data)
    },
  }
}
