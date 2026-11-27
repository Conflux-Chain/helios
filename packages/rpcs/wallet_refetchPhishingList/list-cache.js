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

// Keep the sources separate: a Fluent config is not a copy of MetaMask's list.
const METAMASK_LISTS = 'phishing.metamask'
const METAMASK_META = `${METAMASK_LISTS}.meta`
const FLUENT_LISTS = 'phishing.fluent'
const FLUENT_META = `${FLUENT_LISTS}.meta`
const CACHE_KEYS = [METAMASK_LISTS, METAMASK_META, FLUENT_LISTS, FLUENT_META]
const RETRY_DELAY = 15 * 60 * 1000

function isDue(time, lastCheck, interval) {
  // Treat a clock that moved backwards like a missing check, not a fresh one.
  return (
    !Number.isFinite(lastCheck) ||
    time < lastCheck ||
    time - lastCheck >= interval
  )
}

function restoreDomainLists(domainList, validate) {
  if (!domainList) return undefined
  try {
    const domainLists = normalizeDomainLists(domainList)
    if (validate) validate(domainLists)
    return domainLists
  } catch {
    // Discard only this cache entry. The other source may still be usable offline.
    return undefined
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
  let metaMaskLists
  let metaMaskMeta = {}
  let fluentLists
  let fluentMeta = {}
  let cacheReady
  let refreshInFlight
  const lastFailureAt = {}
  const changes = new EventTarget()

  async function restoreCache() {
    const cache = await storage.get(CACHE_KEYS)
    const meta = cache[METAMASK_META]
    if (validCursor(meta?.cursor)) {
      metaMaskLists = restoreDomainLists(cache[METAMASK_LISTS], validateSize)
      if (metaMaskLists) metaMaskMeta = meta
    }

    fluentLists = restoreDomainLists(cache[FLUENT_LISTS])
    if (fluentLists) fluentMeta = cache[FLUENT_META] ?? {}
  }

  function loadCacheOnce() {
    // Storage may be unavailable. An unlocked refresh can still bootstrap both sources.
    if (!cacheReady) cacheReady = restoreCache().catch(() => {})
    return cacheReady
  }

  async function saveMetaMaskLists(domainLists, meta) {
    // The cursor describes these exact domains. Commit both before exposing
    // changes to readers; an empty diff only needs a metadata write.
    const changed = !areDomainListsEqual(metaMaskLists, domainLists)
    const patch = {[METAMASK_META]: meta}
    if (changed) patch[METAMASK_LISTS] = serializeDomainLists(domainLists)
    await storage.set(patch)
    metaMaskLists = domainLists
    metaMaskMeta = meta
    return changed
  }

  async function updateMetaMaskDiffs(isLocked) {
    if (isLocked()) return false
    const next = await listFetcher.fetchMetamaskDiffs({
      domainLists: metaMaskLists,
      cursor: metaMaskMeta.cursor,
    })
    validateSize(next.domainLists, metaMaskLists)
    if (next.cursor < metaMaskMeta.cursor)
      throw new Error('Outdated MetaMask response')
    if (isLocked()) return false
    return saveMetaMaskLists(next.domainLists, {
      ...metaMaskMeta,
      cursor: next.cursor,
      diffAt: now(),
    })
  }

  async function updateMetaMask(isLocked) {
    if (isLocked()) return false
    let fullChanged = false
    if (!metaMaskLists || isDue(now(), metaMaskMeta.fullAt, FULL_INTERVAL)) {
      const full = await listFetcher.fetchMetamaskFullList(
        metaMaskLists && metaMaskMeta.etag,
      )
      // The wallet may have locked while the download was in flight.
      if (isLocked()) return false
      // A monthly full list may predate diffs we already applied. In that
      // case (or on 304), keep the newer local list and its cursor.
      let domainLists = metaMaskLists
      let cursor = metaMaskMeta.cursor
      if (full && (!metaMaskLists || full.cursor >= cursor)) {
        validateSize(full.domainLists, metaMaskLists)
        domainLists = full.domainLists
        cursor = full.cursor
      }
      fullChanged = await saveMetaMaskLists(domainLists, {
        cursor,
        fullAt: now(),
        etag: full ? full.etag : metaMaskMeta.etag,
        // Catch up immediately. Even after a restart, a failed diff remains due.
        diffAt: null,
      })
    }
    if (!isDue(now(), metaMaskMeta.diffAt, DIFF_INTERVAL)) return fullChanged
    const diffChanged = await tryRefresh(
      'metamask-diffs',
      updateMetaMaskDiffs,
      isLocked,
    )
    return fullChanged || diffChanged
  }

  async function updateFluent(isLocked) {
    if (isLocked()) return false
    if (fluentLists && !isDue(now(), fluentMeta.checkedAt, FLUENT_INTERVAL))
      return false
    const response = await listFetcher.fetchFluentFullList(
      fluentLists && fluentMeta.etag,
    )
    if (isLocked()) return false

    const domainLists = response ? response.domainLists : fluentLists
    const changed = !areDomainListsEqual(fluentLists, domainLists)
    const nextMeta = {
      checkedAt: now(),
      etag: response ? response.etag : fluentMeta.etag,
    }
    const patch = {[FLUENT_META]: nextMeta}
    if (changed) patch[FLUENT_LISTS] = serializeDomainLists(domainLists)
    await storage.set(patch)
    fluentLists = domainLists
    fluentMeta = nextMeta
    return changed
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
      tryRefresh(METAMASK_LISTS, updateMetaMask, isLocked),
      tryRefresh(FLUENT_LISTS, updateFluent, isLocked),
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

  function localVerdict(origin) {
    const results = [fluentLists, metaMaskLists]
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
      const verdict = localVerdict(origin)
      if (pendingSignal?.aborted || isLocked())
        return {verdict, rechecked: Promise.resolve(null)}

      const recheck = () => (isLocked() ? null : localVerdict(origin))
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
