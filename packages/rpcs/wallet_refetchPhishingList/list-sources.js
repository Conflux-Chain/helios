import {initFetcher} from '@fluent-wallet/fetch-rpc'
import {compileFeed, normalizeRule} from './domain-rules.js'

// MetaMask/core phishing-controller: v1 full list plus ordered v2 mutations.
const METAMASK_API = 'https://phishing-detection.api.cx.metamask.io'
const LIST_PREFIX = 'eth_phishing_detect_config.'
export const FULL_URL = `${METAMASK_API}/v1/stalelist`
export const diffUrl = cursor => `${METAMASK_API}/v2/diffsSince/${cursor}`
// A separate path prevents old CDN copies of the retired mirror being read as Fluent rules.
export const FLUENT_URL =
  'https://raw.githubusercontent.com/conflux-fans/phishing-detect/main/config.json'
export const validCursor = n => Number.isSafeInteger(n) && n > 0
function parseMetamaskFullList(payload) {
  const data = payload?.data
  if (
    !validCursor(data?.lastUpdated) ||
    !Number.isSafeInteger(data.version) ||
    data.version < 0
  )
    throw new Error('Invalid MetaMask full list')
  const rules = compileFeed({
    version: 2,
    whitelist: data.allowlist,
    blacklist: data.blocklist,
  })
  validateSize(rules)
  return {rules, cursor: data.lastUpdated}
}
function parseFluentFullList(payload) {
  return {rules: compileFeed(payload)}
}

export function validateSize(rules, previous) {
  if (
    rules.allow.size < 20 ||
    rules.block.size < 50000 ||
    rules.block.size > 500000 ||
    rules.allow.size > 500000 ||
    (previous &&
      (rules.allow.size < previous.allow.size / 2 ||
        rules.block.size < previous.block.size / 2))
  )
    throw new Error('Incomplete MetaMask list')
}

export function applyDiffs(base, diffs) {
  if (!Array.isArray(diffs) || diffs.length > 500000)
    throw new Error('Invalid MetaMask diffs')
  // The cursor is the last upstream event time (seconds), not the local
  // fetch time. Compare every row with the starting cursor: ties are valid.
  let cursor = base.cursor
  const events = []
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
    cursor = Math.max(cursor, row.timestamp)
    let key
    if (row.targetList === `${LIST_PREFIX}blocklist`) key = 'block'
    else if (row.targetList === `${LIST_PREFIX}allowlist`) key = 'allow'
    else continue // Consume the cursor but never turn a path or CID into a host rule.
    const host = normalizeRule(row.url)
    if (host)
      events.push({
        key,
        host,
        remove: row.isRemoval === true,
        time: row.timestamp,
      })
  }
  // Keep the active rules untouched until the batch has been saved. A stable
  // sort preserves upstream order when two events share a timestamp.
  let rules = base.rules
  events.sort((a, b) => a.time - b.time)
  for (const {key, host, remove} of events) {
    const exists = rules[key].has(host)
    if ((remove && !exists) || (!remove && exists)) continue
    if (rules === base.rules) rules = {...rules}
    if (rules[key] === base.rules[key]) rules[key] = new Set(rules[key])
    if (remove) rules[key].delete(host)
    else rules[key].add(host)
  }
  return {rules, cursor}
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

// Translate each source's HTTP format to domain rules; the service owns the
// cursor, ETag and cache lifetime. A conditional 304 needs no new rules.
export function createListSources(
  fetcher = initFetcher({
    throwHttpErrors: false, // handle 304 explicitly
    retry: {limit: 0}, // the service backs off failed downloads
    timeout: false, // fetchJSON bounds the entire body read
  }),
) {
  const MB = 1024 * 1024
  return {
    async fetchMetamaskFullList(etag) {
      const response = await fetchJSON(FULL_URL, fetcher, 64 * MB, etag)
      if (!response) return null
      return {...parseMetamaskFullList(response.data), etag: response.etag}
    },
    async fetchMetamaskDiffs(baseline) {
      const response = await fetchJSON(
        diffUrl(baseline.cursor),
        fetcher,
        16 * MB,
      )
      return applyDiffs(baseline, response.data.data)
    },
    async fetchFluentFullList(etag) {
      const response = await fetchJSON(FLUENT_URL, fetcher, MB, etag)
      if (!response) return null
      return {...parseFluentFullList(response.data), etag: response.etag}
    },
  }
}
