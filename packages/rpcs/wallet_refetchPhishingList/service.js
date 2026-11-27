import {getOriginVerdict} from './domain.js'
import {createListFetcher} from './fetch-list.js'
import {loadStoredState, saveSourceState} from './storage.js'

const DAY = 24 * 60 * 60 * 1000
const METAMASK_FULL_INTERVAL = 30 * DAY
const METAMASK_DIFF_INTERVAL = 5 * DAY
const FLUENT_REFRESH_INTERVAL = DAY
const FAILURE_RETRY_INTERVAL = 15 * 60 * 1000

const listFetcher = createListFetcher()
const sources = {metaMask: null, fluent: null}
const listChanges = new EventTarget()
const lastFailureAt = {}
let loadPromise
let refreshPromise

// The background service is the only owner of active source state.
export async function checkCachedOrigin(origin) {
  await loadCachedLists()
  return getOriginVerdict(origin, {
    metaMask: sources.metaMask?.lists,
    fluent: sources.fluent?.lists,
  })
}

export function subscribeToListChanges(listener) {
  listChanges.addEventListener('updated', listener)
  return () => listChanges.removeEventListener('updated', listener)
}

export async function refreshIfDue(isLocked) {
  const cacheLoaded = await loadCachedLists()
  if (!cacheLoaded || isLocked()) return
  if (!refreshPromise) {
    refreshPromise = Promise.all([
      refreshMetaMaskLists(isLocked),
      refreshWithBackoff('fluent', () => refreshFluentList(isLocked)),
    ]).finally(() => {
      refreshPromise = undefined
    })
  }
  await refreshPromise
}

function loadCachedLists() {
  if (!loadPromise) {
    loadPromise = loadStoredState()
      .then(stored => {
        sources.metaMask = stored.metaMask
        sources.fluent = stored.fluent
        return true
      })
      .catch(error => {
        loadPromise = undefined
        console.warn('[phishing] Failed to load cached lists', error)
        return false
      })
  }
  return loadPromise
}

async function refreshMetaMaskLists(isLocked) {
  if (isRefreshDue(sources.metaMask?.lastFullCheckAt, METAMASK_FULL_INTERVAL)) {
    await refreshWithBackoff('metamask-full', () =>
      refreshMetaMaskFullList(isLocked),
    )
  }
  // A full-list failure must not block due diffs from an existing baseline.
  if (
    sources.metaMask &&
    isRefreshDue(sources.metaMask.lastDiffCheckAt, METAMASK_DIFF_INTERVAL)
  ) {
    await refreshWithBackoff('metamask-diffs', () =>
      refreshMetaMaskDiffs(isLocked),
    )
  }
}

async function refreshMetaMaskFullList(isLocked) {
  if (isLocked()) return
  const full = await listFetcher.fetchMetaMaskFullList(sources.metaMask?.etag)
  if (isLocked()) return

  // Keep newer local diffs when the snapshot is older, or on HTTP 304.
  const current = sources.metaMask
  const latest =
    full && (!current || full.cursor >= current.cursor) ? full : current
  await commitSourceLists('metaMask', {
    ...latest,
    etag: full ? full.etag : current.etag,
    lastFullCheckAt: Date.now(),
    // Persist the catch-up requirement, including across a worker restart.
    lastDiffCheckAt: null,
  })
}

async function refreshMetaMaskDiffs(isLocked) {
  if (isLocked()) return
  const current = sources.metaMask
  const updated = await listFetcher.fetchMetaMaskDiffs(current)
  if (isLocked()) return
  await commitSourceLists('metaMask', {
    ...current,
    ...updated,
    lastDiffCheckAt: Date.now(),
  })
}

async function refreshFluentList(isLocked) {
  const current = sources.fluent
  if (
    isLocked() ||
    !isRefreshDue(current?.lastCheckAt, FLUENT_REFRESH_INTERVAL)
  )
    return
  const full = await listFetcher.fetchFluentFullList(current?.etag)
  if (isLocked()) return
  await commitSourceLists('fluent', {
    ...(full ?? current),
    lastCheckAt: Date.now(),
  })
}

async function refreshWithBackoff(requestName, refresh) {
  if (!isRefreshDue(lastFailureAt[requestName], FAILURE_RETRY_INTERVAL)) return
  try {
    await refresh()
  } catch (error) {
    lastFailureAt[requestName] = Date.now()
    console.warn(`[phishing] Failed to refresh ${requestName}`, error)
  }
}

function isRefreshDue(lastCheck, interval) {
  const now = Date.now()
  return (
    !Number.isFinite(lastCheck) ||
    now < lastCheck ||
    now - lastCheck >= interval
  )
}

async function commitSourceLists(source, next) {
  const current = sources[source]
  const listsChanged = !current || !haveSameDomains(current.lists, next.lists)
  await saveSourceState(source, next, listsChanged)
  sources[source] = next
  if (listsChanged) listChanges.dispatchEvent(new Event('updated'))
}

function haveSameDomains(current, next) {
  for (const key of ['allowlist', 'blocklist']) {
    if (current[key] === next[key]) continue
    if (current[key].size !== next[key].size) return false
    for (const domain of current[key]) {
      if (!next[key].has(domain)) return false
    }
  }
  return true
}
