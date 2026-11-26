import {compileFeed, matchOrigin} from './domains.js'
import {
  FULL_URL,
  diffUrl,
  FLUENT_URL,
  FULL_INTERVAL,
  DIFF_INTERVAL,
  FLUENT_INTERVAL,
  applyDiffs,
  fetchJSON,
  pack,
  sameRules,
  snapshot,
  validCursor,
  validateSize,
} from './feeds.js'

const MM = 'phishing.metamask.v2',
  FL = 'phishing.fluent.v2'
// Never load the former Fluent mirror as a locally curated policy.
const PENDING = MM + '.pending',
  META = MM + '.meta',
  FL_META = FL + '.meta'
const RETRY = 15 * 60 * 1000
const MB = 1024 * 1024
const due = (now, last, interval) =>
  !Number.isFinite(last) || now < last || now - last >= interval

export function createDomainService({
  storage,
  fetchFn = fetch,
  now = Date.now,
}) {
  let mm,
    fluent,
    pending,
    meta = {},
    flMeta = {},
    loading,
    updating
  const retryAt = {},
    changes = new EventTarget()
  function ready() {
    if (!loading)
      loading = storage
        .get([MM, META, PENDING, FL, FL_META])
        .then(cache => {
          try {
            if (cache[MM] && validCursor(cache[META]?.cursor)) {
              const rules = compileFeed(cache[MM])
              validateSize(rules)
              mm = rules
              meta = cache[META]
            }
          } catch {
            /* Invalid MetaMask cache: bootstrap again. */
          }
          try {
            const staged = cache[PENDING]
            if (
              staged &&
              validCursor(staged.cursor) &&
              !due(now(), staged.fetchedAt, FULL_INTERVAL)
            ) {
              const rules = compileFeed(staged.feed)
              validateSize(rules)
              pending = {
                rules,
                cursor: staged.cursor,
                fetchedAt: staged.fetchedAt,
                etag: staged.etag,
              }
            }
          } catch {
            /* Invalid staging data never affects the active list. */
          }
          try {
            if (cache[FL]) {
              fluent = compileFeed(cache[FL])
              flMeta = cache[FL_META] ?? {}
            }
          } catch {
            /* Independent Fluent configuration. */
          }
        })
        .catch(() => {})
    return loading
  }

  async function updateMetaMask(isLocked) {
    const fullDue = !mm || due(now(), meta.fullAt, FULL_INTERVAL)
    if (!fullDue && !due(now(), meta.diffAt, DIFF_INTERVAL)) return false
    if (pending && due(now(), pending.fetchedAt, FULL_INTERVAL))
      pending = undefined
    if (fullDue && !pending) {
      const result = await fetchJSON(
        FULL_URL,
        fetchFn,
        64 * MB,
        mm && meta.etag,
      )
      if (isLocked()) return false
      const fetchedAt = now()
      if (result === null) {
        // Unchanged static snapshot: catch up from the active server cursor.
        pending = {rules: mm, cursor: meta.cursor, fetchedAt, etag: meta.etag}
      } else {
        const full = snapshot(result.data.data)
        // Preserve the last good pair while catching up. If diffs fail, retry
        // only the delta (also after a worker restart), not the large response.
        await storage.set({
          [PENDING]: {
            feed: pack(full.rules),
            cursor: full.cursor,
            fetchedAt,
            etag: result.etag,
          },
        })
        pending = {...full, fetchedAt, etag: result.etag}
      }
    }
    if (isLocked()) return false
    const base = fullDue ? pending : {rules: mm, cursor: meta.cursor}
    const response = await fetchJSON(diffUrl(base.cursor), fetchFn, 16 * MB)
    const next = applyDiffs(base, response.data.data)
    validateSize(next.rules, mm)
    if (mm && next.cursor < meta.cursor)
      throw new Error('Outdated MetaMask response')
    if (isLocked()) return false
    const changed = mm !== next.rules && !sameRules(mm, next.rules)
    const nextMeta = {
      fullAt: fullDue ? base.fetchedAt : meta.fullAt,
      diffAt: now(),
      cursor: next.cursor,
      etag: fullDue ? base.etag : meta.etag,
    }
    await storage.set({
      [META]: nextMeta,
      ...(changed ? {[MM]: pack(next.rules)} : {}),
      ...(fullDue ? {[PENDING]: null} : {}),
    })
    meta = nextMeta
    mm = next.rules
    pending = undefined
    return changed
  }

  async function updateFluent(isLocked) {
    if (fluent && !due(now(), flMeta.checkedAt, FLUENT_INTERVAL)) return false
    const response = await fetchJSON(
      FLUENT_URL,
      fetchFn,
      MB,
      fluent && flMeta.etag,
    )
    if (isLocked()) return false
    const next = response ? compileFeed(response.data) : fluent
    const changed = !sameRules(fluent, next)
    const nextMeta = {
      checkedAt: now(),
      etag: response ? response.etag : flMeta.etag,
    }
    await storage.set({
      [FL_META]: nextMeta,
      ...(changed ? {[FL]: pack(next)} : {}),
    })
    fluent = next
    flMeta = nextMeta
    return changed
  }
  async function attempt(key, fn, isLocked) {
    if (isLocked() || (retryAt[key] && !due(now(), retryAt[key], RETRY)))
      return false
    try {
      return await fn(isLocked)
    } catch {
      retryAt[key] = now()
      return false
    }
  }
  function refresh(isLocked) {
    if (isLocked()) return Promise.resolve(false)
    if (!updating)
      updating = Promise.all([
        attempt(MM, updateMetaMask, isLocked),
        attempt(FL, updateFluent, isLocked),
      ])
        .then(results => {
          const changed = results.some(Boolean)
          if (changed) changes.dispatchEvent(new Event('updated'))
          return changed
        })
        .finally(() => {
          updating = null
        })
    return updating
  }
  function local(origin) {
    // Allowlist exceptions precede blocklists across both sources. Missing
    // data is not a clean result. Neither list overwrites the other's entries.
    const results = [fluent, mm]
      .filter(Boolean)
      .map(rules => matchOrigin(origin, rules))
    return (
      results.find(r => r.status === 'allowlisted') ??
      results.find(r => r.status === 'blocklisted') ??
      (results.length === 2 ? results[0] : {status: 'unknown'})
    )
  }
  return {
    async refreshIfDue(isLocked) {
      await ready()
      return refresh(isLocked)
    },
    async checkOrigin(origin, isLocked, pendingSignal) {
      await ready()
      const verdict = local(origin)
      if (pendingSignal?.aborted || isLocked())
        return {verdict, rechecked: Promise.resolve(null)}
      if (!pendingSignal)
        return {
          verdict,
          rechecked: refresh(isLocked).then(changed =>
            changed && !isLocked() ? local(origin) : null,
          ),
        }
      const rechecked = new Promise(resolve => {
        const finish = result => {
          changes.removeEventListener('updated', onUpdate)
          pendingSignal.removeEventListener('abort', onAbort)
          resolve(result)
        }
        const onUpdate = () => finish(isLocked() ? null : local(origin)),
          onAbort = () => finish(null)
        changes.addEventListener('updated', onUpdate)
        pendingSignal.addEventListener('abort', onAbort)
      })
      void refresh(isLocked)
      return {verdict, rechecked}
    },
  }
}
