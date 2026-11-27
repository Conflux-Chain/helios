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

export function createListCache({
  storage,
  listFetcher = createListFetcher(),
  now = Date.now,
}) {
  const metaMask = cacheEntry('phishing.metamask')
  const fluent = cacheEntry('phishing.fluent')
  let cacheReady
  let refreshInFlight
  const lastFailureAt = {}
  const changes = new EventTarget()

  async function restoreCache() {
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

  function loadCacheOnce() {
    // Storage may be unavailable. An unlocked refresh can still bootstrap both sources.
    if (!cacheReady) cacheReady = restoreCache().catch(() => {})
    return cacheReady
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

  async function updateMetaMaskDiffs(isLocked) {
    if (isLocked()) return false
    const next = await listFetcher.fetchMetamaskDiffs({
      domainLists: metaMask.lists,
      cursor: metaMask.meta.cursor,
    })
    validateSize(next.domainLists, metaMask.lists)
    if (next.cursor < metaMask.meta.cursor)
      throw new Error('Outdated MetaMask response')
    if (isLocked()) return false
    return saveEntry(metaMask, next.domainLists, {
      ...metaMask.meta,
      cursor: next.cursor,
      diffAt: now(),
    })
  }

  async function updateMetaMask(isLocked) {
    if (isLocked()) return false
    let fullChanged = false
    if (!metaMask.lists || isDue(now(), metaMask.meta.fullAt, FULL_INTERVAL)) {
      const full = await listFetcher.fetchMetamaskFullList(metaMask.meta.etag)
      // The wallet may have locked while the download was in flight.
      if (isLocked()) return false
      // A monthly full list may predate diffs we already applied. In that
      // case (or on 304), keep the newer local list and its cursor.
      let domainLists = metaMask.lists
      let cursor = metaMask.meta.cursor
      if (full && (!metaMask.lists || full.cursor >= cursor)) {
        validateSize(full.domainLists, metaMask.lists)
        domainLists = full.domainLists
        cursor = full.cursor
      }
      fullChanged = await saveEntry(metaMask, domainLists, {
        cursor,
        fullAt: now(),
        etag: full ? full.etag : metaMask.meta.etag,
        // Catch up immediately. Even after a restart, a failed diff remains due.
        diffAt: null,
      })
    }
    if (!isDue(now(), metaMask.meta.diffAt, DIFF_INTERVAL)) return fullChanged
    const diffChanged = await tryRefresh(
      'metamask-diffs',
      updateMetaMaskDiffs,
      isLocked,
    )
    return fullChanged || diffChanged
  }

  async function updateFluent(isLocked) {
    if (isLocked()) return false
    if (fluent.lists && !isDue(now(), fluent.meta.checkedAt, FLUENT_INTERVAL))
      return false
    const response = await listFetcher.fetchFluentFullList(fluent.meta.etag)
    if (isLocked()) return false

    return saveEntry(fluent, response ? response.domainLists : fluent.lists, {
      checkedAt: now(),
      etag: response ? response.etag : fluent.meta.etag,
    })
  }

  async function tryRefresh(source, update, isLocked) {
    if (!isDue(now(), lastFailureAt[source], RETRY_DELAY)) return false
    try {
      return await update(isLocked)
    } catch {
      lastFailureAt[source] = now()
      return false
    }
  }

  async function refreshSources(isLocked) {
    const [metaMaskChanged, fluentChanged] = await Promise.all([
      tryRefresh(metaMask.key, updateMetaMask, isLocked),
      tryRefresh(fluent.key, updateFluent, isLocked),
    ])
    if (!metaMaskChanged && !fluentChanged) return false
    changes.dispatchEvent(new Event('updated'))
    return true
  }

  function refresh(isLocked) {
    if (isLocked()) return Promise.resolve(false)
    if (!refreshInFlight) {
      refreshInFlight = refreshSources(isLocked).finally(() => {
        refreshInFlight = undefined
      })
    }
    return refreshInFlight
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

  return {
    async refreshIfDue(isLocked) {
      await loadCacheOnce()
      return refresh(isLocked)
    },
    async checkOrigin(origin, isLocked, pendingSignal) {
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
    },
  }
}
