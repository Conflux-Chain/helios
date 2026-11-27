import {initFetcher} from '@fluent-wallet/fetch-rpc'
import {normalizeDomainLists, normalizeDomain} from './domain.js'

// MetaMask/core phishing-controller: v1 full list plus ordered v2 mutations.
const METAMASK_API = 'https://phishing-detection.api.cx.metamask.io'
const LIST_PREFIX = 'eth_phishing_detect_config.'
const ALLOW_LIST = `${LIST_PREFIX}allowlist`
const BLOCK_LIST = `${LIST_PREFIX}blocklist`
export const FULL_URL = `${METAMASK_API}/v1/stalelist`
export const diffUrl = cursor => `${METAMASK_API}/v2/diffsSince/${cursor}`
// A separate path prevents old CDN copies of the retired mirror being read as Fluent-maintained domains.
export const FLUENT_URL =
  'https://raw.githubusercontent.com/conflux-fans/phishing-detect/main/config.json'
export const validCursor = n => Number.isSafeInteger(n) && n > 0
function parseMetamaskFullList(payload) {
  const data = payload?.data
  if (!validCursor(data?.lastUpdated))
    throw new Error('Invalid MetaMask full list')
  const domainLists = normalizeDomainLists({
    whitelist: data.allowlist,
    blacklist: data.blocklist,
  })
  validateSize(domainLists)
  return {domainLists, cursor: data.lastUpdated}
}
function parseFluentFullList(payload) {
  return {domainLists: normalizeDomainLists(payload)}
}

export function validateSize(domainLists, previous) {
  if (
    domainLists.allow.size < 20 ||
    domainLists.block.size < 50000 ||
    domainLists.block.size > 500000 ||
    domainLists.allow.size > 500000 ||
    (previous &&
      (domainLists.allow.size < previous.allow.size / 2 ||
        domainLists.block.size < previous.block.size / 2))
  )
    throw new Error('Incomplete MetaMask list')
}

export function applyDiffs(base, diffs) {
  if (!Array.isArray(diffs) || diffs.length > 500000)
    throw new Error('Invalid MetaMask diffs')
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

// Auth-free, fixed-source requests only. Bound decompressed bytes as well as headers.
export async function fetchJSON(url, fetcher, limit, etag) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 30_000)
  try {
    const res = await fetcher(url, {
      signal: controller.signal,
      cache: 'no-cache',
      redirect: 'error',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      ...(etag ? {headers: {'If-None-Match': etag}} : {}),
    })
    if (res.status === 304 && etag) return null
    if (res.status !== 200 || Number(res.headers.get('content-length')) > limit)
      throw new Error('Invalid phishing feed response')
    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8', {fatal: true})
    const parts = []
    let bytes = 0
    try {
      for (;;) {
        const {value, done} = await reader.read()
        if (done) break
        bytes += value.byteLength
        if (bytes > limit) throw new Error('Phishing feed too large')
        parts.push(decoder.decode(value, {stream: true}))
      }
      parts.push(decoder.decode())
    } finally {
      reader.releaseLock()
    }
    return {data: JSON.parse(parts.join('')), etag: res.headers.get('etag')}
  } finally {
    controller.abort()
    clearTimeout(timer)
  }
}

// Translate each source's HTTP format to domain lists; the service owns the
// cursor, ETag and cache lifetime. A conditional 304 needs no new lists.
export function createListFetcher(
  fetcher = initFetcher({
    throwHttpErrors: false, // handle 304 explicitly
    retry: {limit: 0}, // the service backs off failed downloads
    timeout: false, // fetchJSON bounds the entire body read
  }),
) {
  const MB = 1024 * 1024
  async function fetchFullList(url, limit, parse, etag) {
    const response = await fetchJSON(url, fetcher, limit, etag)
    if (!response) return null
    return {...parse(response.data), etag: response.etag}
  }

  return {
    fetchMetamaskFullList: etag =>
      fetchFullList(FULL_URL, 64 * MB, parseMetamaskFullList, etag),
    fetchFluentFullList: etag =>
      fetchFullList(FLUENT_URL, MB, parseFluentFullList, etag),
    async fetchMetamaskDiffs(baseline) {
      const response = await fetchJSON(
        diffUrl(baseline.cursor),
        fetcher,
        16 * MB,
      )
      return applyDiffs(baseline, response.data.data)
    },
  }
}
