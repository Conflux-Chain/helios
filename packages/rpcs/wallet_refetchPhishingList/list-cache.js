import browser from 'webextension-polyfill'
import {
  normalizeDomainLists,
  matchOrigin,
  areDomainListsEqual,
  serializeDomainLists,
} from './domain.js'
import {createListFetcher, validCursor, validateSize} from './fetch-list.js'

const DAY = 24 * 60 * 60 * 1000
export const FULL_INTERVAL = 30 * DAY
export const DIFF_INTERVAL = 5 * DAY
export const FLUENT_INTERVAL = DAY

const RETRY_DELAY = 15 * 60 * 1000

// Both entry points run in the same background worker and share these lists.
const storage = browser.storage.local
const listFetcher = createListFetcher()
const metaMask = cacheEntry('phishing.metamask')
const fluent = cacheEntry('phishing.fluent')
const changes = new EventTarget()
const lastFailureAt = {}
let cacheReady
let refreshInFlight

// Called on unlock. A true result means the stored domains changed.
export async function refreshIfDue(isLocked) {
  await loadCacheOnce()
  return refresh(isLocked)
}

// Return the cached answer first; recheck the same origin when new lists arrive.
export async function checkPhishingOrigin(origin, isLocked, pendingSignal) {
  await loadCacheOnce()
  const verdict = matchCachedOrigin(origin)
  if (pendingSignal?.aborted || isLocked())
    return {verdict, rechecked: Promise.resolve(null)}

  const recheck = () => (isLocked() ? null : matchCachedOrigin(origin))
  if (pendingSignal) {
    const rechecked = waitForListChange(changes, pendingSignal, recheck)
    void refresh(isLocked)
    return {verdict, rechecked}
  }
  const rechecked = refresh(isLocked).then(changed =>
    changed ? recheck() : null,
  )
  return {verdict, rechecked}
}

function loadCacheOnce() {
  // Storage may be unavailable. An unlocked refresh can still bootstrap both sources.
  if (!cacheReady) cacheReady = readStoredLists().catch(() => {})
  return cacheReady
}

function refresh(isLocked) {
  if (isLocked()) return Promise.resolve(false)
  if (!refreshInFlight) {
    refreshInFlight = refreshSources(isLocked).finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

async function refreshSources(isLocked) {
  const [metaMaskChanged, fluentChanged] = await Promise.all([
    updateMetaMask(isLocked),
    tryRefresh(fluent.key, () => updateFluent(isLocked)),
  ])
  if (!metaMaskChanged && !fluentChanged) return false
  changes.dispatchEvent(new Event('updated'))
  return true
}

async function updateMetaMask(isLocked) {
  if (isLocked()) return false
  let fullChanged = false
  if (
    !metaMask.lists ||
    isDue(Date.now(), metaMask.meta.fullAt, FULL_INTERVAL)
  ) {
    fullChanged = await tryRefresh('metamask-full', () =>
      updateMetaMaskFullList(isLocked),
    )
  }

  // Full-list failure or backoff must not block due diffs from a valid cache.
  if (
    !metaMask.lists ||
    !validCursor(metaMask.meta.cursor) ||
    !isDue(Date.now(), metaMask.meta.diffAt, DIFF_INTERVAL)
  )
    return fullChanged
  const diffChanged = await tryRefresh('metamask-diffs', () =>
    updateMetaMaskDiffs(isLocked),
  )
  return fullChanged || diffChanged
}

async function updateMetaMaskFullList(isLocked) {
  if (isLocked()) return false
  const entry = metaMask
  const full = await listFetcher.fetchMetamaskFullList(entry.meta.etag)
  // The wallet may have locked while the download was in flight.
  if (isLocked()) return false
  // A monthly full list may predate diffs we already applied. In that
  // case (or on 304), keep the newer local list and its cursor.
  let domainLists = entry.lists
  let cursor = entry.meta.cursor
  if (full && (!entry.lists || full.cursor >= cursor)) {
    validateSize(full.domainLists, entry.lists)
    domainLists = full.domainLists
    cursor = full.cursor
  }
  return saveEntry(entry, domainLists, {
    cursor,
    fullAt: Date.now(),
    etag: full ? full.etag : entry.meta.etag,
    // Catch up immediately. Even after a restart, a failed diff remains due.
    diffAt: null,
  })
}

async function updateMetaMaskDiffs(isLocked) {
  if (isLocked()) return false
  const entry = metaMask
  const next = await listFetcher.fetchMetamaskDiffs({
    domainLists: entry.lists,
    cursor: entry.meta.cursor,
  })
  validateSize(next.domainLists, entry.lists)
  if (next.cursor < entry.meta.cursor)
    throw new Error('Outdated MetaMask response')
  if (isLocked()) return false
  return saveEntry(entry, next.domainLists, {
    ...entry.meta,
    cursor: next.cursor,
    diffAt: Date.now(),
  })
}

async function updateFluent(isLocked) {
  if (isLocked()) return false
  const entry = fluent
  if (entry.lists && !isDue(Date.now(), entry.meta.checkedAt, FLUENT_INTERVAL))
    return false
  const response = await listFetcher.fetchFluentFullList(entry.meta.etag)
  if (isLocked()) return false

  return saveEntry(entry, response ? response.domainLists : entry.lists, {
    checkedAt: Date.now(),
    etag: response ? response.etag : entry.meta.etag,
  })
}

async function tryRefresh(source, update) {
  if (!isDue(Date.now(), lastFailureAt[source], RETRY_DELAY)) return false
  try {
    return await update()
  } catch {
    lastFailureAt[source] = Date.now()
    return false
  }
}

function cacheEntry(key) {
  return {key, metaKey: `${key}.meta`, lists: undefined, meta: {}}
}

function isDue(time, lastCheck, interval) {
  // Treat a clock that moved backwards like a missing check, not a fresh one.
  return (
    !Number.isFinite(lastCheck) ||
    time < lastCheck ||
    time - lastCheck >= interval
  )
}

function restoreEntry(entry, stored, validate) {
  if (!stored[entry.key]) return
  try {
    const lists = normalizeDomainLists(stored[entry.key])
    if (validate) validate(lists)
    entry.lists = lists
    entry.meta = stored[entry.metaKey] ?? {}
  } catch {
    // A bad entry must not prevent us from restoring the other source.
  }
}

// A pending request outlives a single refresh. Stop listening on either a
// verified change or dismissal; cancelling one request must not cancel the download.
function waitForListChange(changes, signal, getVerdict) {
  return new Promise(resolve => {
    function finish(verdict) {
      changes.removeEventListener('updated', onUpdate)
      signal.removeEventListener('abort', onAbort)
      resolve(verdict)
    }
    const onUpdate = () => finish(getVerdict())
    const onAbort = () => finish(null)
    changes.addEventListener('updated', onUpdate)
    signal.addEventListener('abort', onAbort)
  })
}

async function readStoredLists() {
  const stored = await storage.get([
    metaMask.key,
    metaMask.metaKey,
    fluent.key,
    fluent.metaKey,
  ])
  if (validCursor(stored[metaMask.metaKey]?.cursor))
    restoreEntry(metaMask, stored, validateSize)
  restoreEntry(fluent, stored)
}

async function saveEntry(entry, lists, meta) {
  // Commit the lists and their metadata together. If only freshness or the
  // cursor changed, skip serializing and rewriting the domain arrays.
  const changed = !areDomainListsEqual(entry.lists, lists)
  const patch = {[entry.metaKey]: meta}
  if (changed) patch[entry.key] = serializeDomainLists(lists)
  await storage.set(patch)
  entry.lists = lists
  entry.meta = meta
  return changed
}

function matchCachedOrigin(origin) {
  const results = [fluent.lists, metaMask.lists]
    .filter(Boolean)
    .map(domainLists => matchOrigin(origin, domainLists))
  // An explicit exception from either source wins. A known block still matters
  // if the other source is offline, but we can't claim a complete no-match.
  const allowed = results.find(result => result.status === 'allowlisted')
  if (allowed) return allowed
  const blocked = results.find(result => result.status === 'blocklisted')
  if (blocked) return blocked
  return results.length === 2 ? results[0] : {status: 'unknown'}
}
