import {
  buildDomainRules,
  matchOrigin,
  sameRules,
  serializeRules,
} from './domain-rules.js'
import {createListSources, validCursor, validateSize} from './list-sources.js'

const DAY = 24 * 60 * 60 * 1000
export const FULL_INTERVAL = 30 * DAY
export const DIFF_INTERVAL = 5 * DAY
export const FLUENT_INTERVAL = DAY

// Keep the sources separate: a Fluent config is not a copy of MetaMask's list.
const METAMASK_RULES = 'phishing.metamask.v2'
const METAMASK_META = `${METAMASK_RULES}.meta`
const STAGED_FULL_LIST = `${METAMASK_RULES}.pending`
const FLUENT_RULES = 'phishing.fluent.v2'
const FLUENT_META = `${FLUENT_RULES}.meta`
const CACHE_KEYS = [
  METAMASK_RULES,
  METAMASK_META,
  STAGED_FULL_LIST,
  FLUENT_RULES,
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

function restoreRules(domainList, validate) {
  if (!domainList) return undefined
  try {
    const rules = buildDomainRules(domainList)
    if (validate) validate(rules)
    return rules
  } catch {
    // Discard only this cache entry. The other source may still be usable offline.
    return undefined
  }
}

// A pending request outlives a single refresh. Stop listening on either a
// verified change or dismissal; cancelling one request must not cancel the download.
function waitForRuleChange(changes, signal, getVerdict) {
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

export function createDomainService({
  storage,
  sources = createListSources(),
  now = Date.now,
}) {
  let metaMaskRules
  let metaMaskMeta = {}
  let stagedFullList
  let fluentRules
  let fluentMeta = {}
  let cacheReady
  let refreshInFlight
  const lastFailureAt = {}
  const changes = new EventTarget()

  async function restoreCache() {
    const cache = await storage.get(CACHE_KEYS)
    const meta = cache[METAMASK_META]
    if (validCursor(meta?.cursor)) {
      metaMaskRules = restoreRules(cache[METAMASK_RULES], validateSize)
      if (metaMaskRules) metaMaskMeta = meta
    }

    const staged = cache[STAGED_FULL_LIST]
    if (
      validCursor(staged?.cursor) &&
      !isDue(now(), staged.fetchedAt, FULL_INTERVAL)
    ) {
      const rules = restoreRules(staged.feed, validateSize)
      if (rules)
        stagedFullList = {
          rules,
          cursor: staged.cursor,
          fetchedAt: staged.fetchedAt,
          etag: staged.etag,
        }
    }

    fluentRules = restoreRules(cache[FLUENT_RULES])
    if (fluentRules) fluentMeta = cache[FLUENT_META] ?? {}
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

    const response = await sources.fetchMetamaskFullList(
      metaMaskRules && metaMaskMeta.etag,
    )
    if (isLocked()) return null
    const fetchedAt = now()
    if (response === null) {
      // HTTP 304: our active rules already include previous diffs. Resume from
      // their cursor instead of replaying everything since the original full list.
      stagedFullList = {
        rules: metaMaskRules,
        cursor: metaMaskMeta.cursor,
        fetchedAt,
        etag: metaMaskMeta.etag,
      }
    } else {
      const {rules, cursor, etag} = response
      // Save the baseline, but don't serve it yet. If catch-up fails or the worker
      // restarts, retry only the delta and keep serving the last verified rules.
      await storage.set({
        [STAGED_FULL_LIST]: {
          feed: serializeRules(rules),
          cursor,
          fetchedAt,
          etag,
        },
      })
      stagedFullList = {rules, cursor, fetchedAt, etag}
    }
    return stagedFullList
  }

  async function updateMetaMask(isLocked) {
    const needsFullList =
      !metaMaskRules || isDue(now(), metaMaskMeta.fullAt, FULL_INTERVAL)
    if (!needsFullList && !isDue(now(), metaMaskMeta.diffAt, DIFF_INTERVAL))
      return false

    const baseline = needsFullList
      ? await getFullListForCatchUp(isLocked)
      : {
          rules: metaMaskRules,
          cursor: metaMaskMeta.cursor,
          fetchedAt: metaMaskMeta.fullAt,
          etag: metaMaskMeta.etag,
        }
    if (!baseline || isLocked()) return false

    const next = await sources.fetchMetamaskDiffs(baseline)
    validateSize(next.rules, metaMaskRules)
    if (metaMaskRules && next.cursor < metaMaskMeta.cursor)
      throw new Error('Outdated MetaMask response')
    if (isLocked()) return false

    // The server cursor belongs to these exact rules. Persist them together
    // before exposing the new verdict. Empty diffs only need a metadata write.
    const changed = !sameRules(metaMaskRules, next.rules)
    const nextMeta = {
      fullAt: baseline.fetchedAt,
      diffAt: now(),
      cursor: next.cursor,
      etag: baseline.etag,
    }
    const patch = {[METAMASK_META]: nextMeta}
    if (changed) patch[METAMASK_RULES] = serializeRules(next.rules)
    if (needsFullList) patch[STAGED_FULL_LIST] = null
    await storage.set(patch)
    metaMaskMeta = nextMeta
    metaMaskRules = next.rules
    stagedFullList = undefined
    return changed
  }

  async function updateFluent(isLocked) {
    if (fluentRules && !isDue(now(), fluentMeta.checkedAt, FLUENT_INTERVAL))
      return false
    const response = await sources.fetchFluentFullList(
      fluentRules && fluentMeta.etag,
    )
    if (isLocked()) return false

    const rules = response ? response.rules : fluentRules
    const changed = !sameRules(fluentRules, rules)
    const nextMeta = {
      checkedAt: now(),
      etag: response ? response.etag : fluentMeta.etag,
    }
    const patch = {[FLUENT_META]: nextMeta}
    if (changed) patch[FLUENT_RULES] = serializeRules(rules)
    await storage.set(patch)
    fluentRules = rules
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
      tryRefresh(METAMASK_RULES, updateMetaMask, isLocked),
      tryRefresh(FLUENT_RULES, updateFluent, isLocked),
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
    const results = [fluentRules, metaMaskRules]
      .filter(Boolean)
      .map(rules => matchOrigin(origin, rules))
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
        const rechecked = waitForRuleChange(changes, pendingSignal, recheck)
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
