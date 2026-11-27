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

// One instance per background worker, shared by unlock and origin checks.
export class PhishingListCache {
  constructor({storage, listFetcher = createListFetcher(), now = Date.now}) {
    this.storage = storage
    this.listFetcher = listFetcher
    this.now = now
    this.metaMask = cacheEntry('phishing.metamask')
    this.fluent = cacheEntry('phishing.fluent')
    this.cacheReady = null
    this.refreshInFlight = null
    this.lastFailureAt = {}
    this.changes = new EventTarget()
  }

  // Called on unlock. A true result means the stored domains changed.
  async refreshIfDue(isLocked) {
    await this.loadCacheOnce()
    return this.refresh(isLocked)
  }

  // Return the cached answer first; recheck the same origin when new lists arrive.
  async checkOrigin(origin, isLocked, pendingSignal) {
    await this.loadCacheOnce()
    const verdict = matchCachedOrigin(origin, this.fluent, this.metaMask)
    if (pendingSignal?.aborted || isLocked())
      return {verdict, rechecked: Promise.resolve(null)}

    const recheck = () =>
      isLocked() ? null : matchCachedOrigin(origin, this.fluent, this.metaMask)
    if (pendingSignal) {
      const rechecked = waitForListChange(this.changes, pendingSignal, recheck)
      void this.refresh(isLocked)
      return {verdict, rechecked}
    }
    const rechecked = this.refresh(isLocked).then(changed =>
      changed ? recheck() : null,
    )
    return {verdict, rechecked}
  }

  loadCacheOnce() {
    // Storage may be unavailable. An unlocked refresh can still bootstrap both sources.
    if (!this.cacheReady)
      this.cacheReady = readStoredLists(
        this.storage,
        this.metaMask,
        this.fluent,
      ).catch(() => {})
    return this.cacheReady
  }

  refresh(isLocked) {
    if (isLocked()) return Promise.resolve(false)
    if (!this.refreshInFlight) {
      this.refreshInFlight = this.refreshSources(isLocked).finally(() => {
        this.refreshInFlight = null
      })
    }
    return this.refreshInFlight
  }

  async refreshSources(isLocked) {
    const [metaMaskChanged, fluentChanged] = await Promise.all([
      this.tryRefresh(this.metaMask.key, () => this.updateMetaMask(isLocked)),
      this.tryRefresh(this.fluent.key, () => this.updateFluent(isLocked)),
    ])
    if (!metaMaskChanged && !fluentChanged) return false
    this.changes.dispatchEvent(new Event('updated'))
    return true
  }

  async updateMetaMask(isLocked) {
    if (isLocked()) return false
    const entry = this.metaMask
    let fullChanged = false
    if (!entry.lists || isDue(this.now(), entry.meta.fullAt, FULL_INTERVAL)) {
      const full = await this.listFetcher.fetchMetamaskFullList(entry.meta.etag)
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
      fullChanged = await saveEntry(this.storage, entry, domainLists, {
        cursor,
        fullAt: this.now(),
        etag: full ? full.etag : entry.meta.etag,
        // Catch up immediately. Even after a restart, a failed diff remains due.
        diffAt: null,
      })
    }
    if (!isDue(this.now(), entry.meta.diffAt, DIFF_INTERVAL)) return fullChanged
    const diffChanged = await this.tryRefresh('metamask-diffs', () =>
      this.updateMetaMaskDiffs(isLocked),
    )
    return fullChanged || diffChanged
  }

  async updateMetaMaskDiffs(isLocked) {
    if (isLocked()) return false
    const entry = this.metaMask
    const next = await this.listFetcher.fetchMetamaskDiffs({
      domainLists: entry.lists,
      cursor: entry.meta.cursor,
    })
    validateSize(next.domainLists, entry.lists)
    if (next.cursor < entry.meta.cursor)
      throw new Error('Outdated MetaMask response')
    if (isLocked()) return false
    return saveEntry(this.storage, entry, next.domainLists, {
      ...entry.meta,
      cursor: next.cursor,
      diffAt: this.now(),
    })
  }

  async updateFluent(isLocked) {
    if (isLocked()) return false
    const entry = this.fluent
    if (
      entry.lists &&
      !isDue(this.now(), entry.meta.checkedAt, FLUENT_INTERVAL)
    )
      return false
    const response = await this.listFetcher.fetchFluentFullList(entry.meta.etag)
    if (isLocked()) return false

    return saveEntry(
      this.storage,
      entry,
      response ? response.domainLists : entry.lists,
      {
        checkedAt: this.now(),
        etag: response ? response.etag : entry.meta.etag,
      },
    )
  }

  async tryRefresh(source, update) {
    if (!isDue(this.now(), this.lastFailureAt[source], RETRY_DELAY))
      return false
    try {
      return await update()
    } catch {
      this.lastFailureAt[source] = this.now()
      return false
    }
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

async function readStoredLists(storage, metaMask, fluent) {
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

async function saveEntry(storage, entry, lists, meta) {
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

function matchCachedOrigin(origin, fluent, metaMask) {
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
