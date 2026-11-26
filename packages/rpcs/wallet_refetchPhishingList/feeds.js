import {compileFeed, normalizeRule} from './domains.js'

// MetaMask/core phishing-controller: v1 snapshot plus ordered v2 mutations.
const api = 'https://phishing-detection.api.cx.metamask.io'
export const FULL_URL = `${api}/v1/stalelist`
export const diffUrl = cursor => `${api}/v2/diffsSince/${cursor}`
// A separate path prevents old CDN copies of the retired mirror being read as Fluent rules.
export const FLUENT_URL =
  'https://raw.githubusercontent.com/conflux-fans/phishing-detect/main/config.json'
const DAY = 24 * 60 * 60 * 1000
export const FULL_INTERVAL = 30 * DAY
export const DIFF_INTERVAL = 5 * DAY
export const FLUENT_INTERVAL = DAY
export const validCursor = n => Number.isSafeInteger(n) && n > 0
export const pack = ({allow, block}) => ({
  version: 2,
  whitelist: [...allow],
  blacklist: [...block],
})
export const sameRules = (a, b) =>
  !!a &&
  ['allow', 'block'].every(
    k => a[k].size === b[k].size && [...a[k]].every(h => b[k].has(h)),
  )

export function snapshot(data) {
  if (
    !validCursor(data?.lastUpdated) ||
    !Number.isSafeInteger(data.version) ||
    data.version < 0
  )
    throw new Error('Invalid MetaMask snapshot')
  const rules = compileFeed({
    version: 2,
    whitelist: data.allowlist,
    blacklist: data.blocklist,
  })
  validateSize(rules)
  return {rules, cursor: data.lastUpdated}
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
  const since = base.cursor
  let cursor = since,
    rules = base.rules
  const events = []
  for (const row of diffs) {
    if (
      !validCursor(row?.timestamp) ||
      typeof row.targetList !== 'string' ||
      typeof row.url !== 'string' ||
      (row.isRemoval !== undefined && typeof row.isRemoval !== 'boolean')
    )
      throw new Error('Invalid MetaMask diff')
    if (
      row.timestamp <= since ||
      !row.targetList.startsWith('eth_phishing_detect_config.')
    )
      continue
    cursor = Math.max(cursor, row.timestamp)
    const key =
      row.targetList === 'eth_phishing_detect_config.blocklist'
        ? 'block'
        : row.targetList === 'eth_phishing_detect_config.allowlist'
        ? 'allow'
        : null
    if (!key) continue // Never treat paths, fuzzy matches or CIDs as parent-domain rules.
    const host = normalizeRule(row.url)
    if (host)
      events.push({
        key,
        host,
        remove: row.isRemoval === true,
        time: row.timestamp,
      })
  }
  // Apply chronologically, preserving response order for ties. Clone only on change.
  for (const {key, host, remove} of events.sort((a, b) => a.time - b.time)) {
    if (rules[key].has(host) !== remove) continue
    if (rules === base.rules) rules = {...rules}
    if (rules[key] === base.rules[key]) rules[key] = new Set(rules[key])
    if (remove) rules[key].delete(host)
    else rules[key].add(host)
  }
  return {rules, cursor}
}

// Auth-free, fixed-source requests only. Bound decompressed bytes as well as headers.
export async function fetchJSON(url, fetchFn, limit, etag) {
  const ctl = new AbortController(),
    timer = setTimeout(() => ctl.abort(), 30000)
  try {
    const res = await fetchFn(url, {
      signal: ctl.signal,
      cache: 'no-cache',
      redirect: 'error',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      ...(etag ? {headers: {'If-None-Match': etag}} : {}),
    })
    if (res.status === 304 && etag) return null
    if (res.status !== 200 || Number(res.headers.get('content-length')) > limit)
      throw new Error('Invalid phishing feed response')
    const reader = res.body.getReader(),
      decoder = new TextDecoder('utf-8', {fatal: true}),
      parts = []
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
    ctl.abort()
    clearTimeout(timer)
  }
}
