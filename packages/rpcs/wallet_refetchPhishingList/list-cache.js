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
const METAMASK_LISTS = 'phishing.metamask.v2'
const METAMASK_META = `${METAMASK_LISTS}.meta`
const STAGED_FULL_LIST = `${METAMASK_LISTS}.pending`
const FLUENT_LISTS = 'phishing.fluent.v2'
const FLUENT_META = `${FLUENT_LISTS}.meta`
const CACHE_KEYS = [
  METAMASK_LISTS,
  METAMASK_META,
  STAGED_FULL_LIST,
  FLUENT_LISTS,
  FLUENT_META,
]
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
  let stagedFullList
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

    const staged = cache[STAGED_FULL_LIST]
    if (
      validCursor(staged?.cursor) &&
      !isDue(now(), staged.fetchedAt, FULL_INTERVAL)
    ) {
      const domainLists = restoreDomainLists(staged.feed, validateSize)
      if (domainLists)
        stagedFullList = {
          domainLists,
          cursor: staged.cursor,
          fetchedAt: staged.fetchedAt,
          etag: staged.etag,
        }
    }

    fluentLists = restoreDomainLists(cache[FLUENT_LISTS])
    if (fluentLists) fluentMeta = cache[FLUENT_META] ?? {}
  }

  function loadCacheOnce() {
    // Storage may be unavailable. An unlocked refresh can still bootstrap both sources.
    if (!cacheReady) cacheReady = restoreCache().catch(() => {})
    return cacheReady
  }

  async function getFullListForCatchUp(isLocked) {
    if (
      stagedFullList &&
      !isDue(now(), stagedFullList.fetchedAt, FULL_INTERVAL)
    )
      return stagedFullList

    const response = await listFetcher.fetchMetamaskFullList(
      metaMaskLists && metaMaskMeta.etag,
    )
    if (isLocked()) return null
    const fetchedAt = now()
    if (response === null) {
      // HTTP 304: our active lists already include previous diffs. Resume from
      // their cursor instead of replaying everything since the original full list.
      stagedFullList = {
        domainLists: metaMaskLists,
        cursor: metaMaskMeta.cursor,
        fetchedAt,
        etag: metaMaskMeta.etag,
      }
    } else {
      const {domainLists, cursor, etag} = response
      // Save the baseline, but don't serve it yet. If catch-up fails or the worker
      // restarts, retry only the delta and keep serving the last verified lists.
      await storage.set({
        [STAGED_FULL_LIST]: {
          feed: serializeDomainLists(domainLists),
          cursor,
          fetchedAt,
          etag,
        },
      })
      stagedFullList = {domainLists, cursor, fetchedAt, etag}
    }
    return stagedFullList
  }

  async function updateMetaMask(isLocked) {
    const needsFullList =
      !metaMaskLists || isDue(now(), metaMaskMeta.fullAt, FULL_INTERVAL)
    if (!needsFullList && !isDue(now(), metaMaskMeta.diffAt, DIFF_INTERVAL))
      return false

    const baseline = needsFullList
      ? await getFullListForCatchUp(isLocked)
      : {
          domainLists: metaMaskLists,
          cursor: metaMaskMeta.cursor,
          fetchedAt: metaMaskMeta.fullAt,
          etag: metaMaskMeta.etag,
        }
    if (!baseline || isLocked()) return false

    const next = await listFetcher.fetchMetamaskDiffs(baseline)
    validateSize(next.domainLists, metaMaskLists)
    if (metaMaskLists && next.cursor < metaMaskMeta.cursor)
      throw new Error('Outdated MetaMask response')
    if (isLocked()) return false

    // The server cursor belongs to these exact lists. Persist them together
    // before exposing the new verdict. Empty diffs only need a metadata write.
    const changed = !areDomainListsEqual(metaMaskLists, next.domainLists)
    const nextMeta = {
      fullAt: baseline.fetchedAt,
      diffAt: now(),
      cursor: next.cursor,
      etag: baseline.etag,
    }
    const patch = {[METAMASK_META]: nextMeta}
    if (changed) patch[METAMASK_LISTS] = serializeDomainLists(next.domainLists)
    if (needsFullList) patch[STAGED_FULL_LIST] = null
    await storage.set(patch)
    metaMaskMeta = nextMeta
    metaMaskLists = next.domainLists
    stagedFullList = undefined
    return changed
  }

  async function updateFluent(isLocked) {
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
    if (isLocked() || !isDue(now(), lastFailureAt[source], RETRY_DELAY))
      return false
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
