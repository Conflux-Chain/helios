import {compileFeed, matchOrigin} from './domains.js'

const ROOT =
  'https://raw.githubusercontent.com/conflux-fans/phishing-detect/main/'
const LIST_KEY = 'phishing.fluentDomains.v1'
const META_KEY = 'phishing.fluentCheck.v1'
export const MAX_AGE = 6 * 60 * 60 * 1000
const RETRY_DELAY = 60 * 1000
const MAX_BYTES = 12 * 1024 * 1024
const UNKNOWN = {status: 'unknown'}

// The stamp and list may be served by different CDN caches. Hash the exact
// downloaded bytes before decoding; never activate a mismatched publication.
async function readBytes(file, limit, fetchFn) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 30000)
  try {
    const res = await fetchFn(ROOT + file, {
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      redirect: 'error',
      cache: 'no-cache',
      signal: controller.signal,
    })
    if (res.status !== 200 || Number(res.headers.get('content-length')) > limit)
      throw new Error('Invalid phishing feed response')
    const reader = res.body.getReader(),
      chunks = []
    let size = 0
    try {
      for (;;) {
        const {done, value} = await reader.read()
        if (done) break
        size += value.byteLength
        if (size > limit) throw new Error('Phishing feed too large')
        chunks.push(value)
      }
    } finally {
      reader.releaseLock()
    }
    const bytes = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) {
      bytes.set(chunk, offset)
      offset += chunk.length
    }
    return bytes
  } finally {
    controller.abort()
    clearTimeout(timer)
  }
}
const text = bytes => new TextDecoder('utf-8', {fatal: true}).decode(bytes)
const sha256 = async bytes =>
  Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b =>
    b.toString(16).padStart(2, '0'),
  ).join('')
function prepare(raw) {
  const rules = compileFeed(JSON.parse(raw))
  if (rules.allow.size < 20 || rules.block.size < 50000)
    throw new Error('Incomplete domain feed')
  return rules
}

export function createDomainService({
  storage,
  fetchFn = fetch,
  now = Date.now,
}) {
  let active, hash, lastFailure, loading, updating
  let checkedAt = 0
  const changes = new EventTarget()

  async function restore() {
    try {
      const data = await storage.get([META_KEY, LIST_KEY]),
        raw = data[LIST_KEY],
        meta = data[META_KEY]
      if (
        typeof raw !== 'string' ||
        raw.length > MAX_BYTES ||
        !meta ||
        (await sha256(new TextEncoder().encode(raw))) !== meta.hash
      )
        return
      active = prepare(raw)
      hash = meta.hash
      checkedAt = Number.isFinite(meta.checkedAt) ? meta.checkedAt : 0
    } catch {
      /* No usable cache. First verdict is unknown until a validated download. */
    }
  }
  function ready() {
    if (!loading) loading = restore()
    return loading
  }
  async function update(isLocked) {
    try {
      const stamp = JSON.parse(
        text(await readBytes('source.json', 8192, fetchFn)),
      )
      const next = stamp.domainsSha256
      if (typeof next !== 'string' || !/^[0-9a-f]{64}$/.test(next))
        throw new Error('Invalid phishing feed stamp')
      if (isLocked()) return false
      if (active && next === hash) {
        const time = now()
        await storage.set({[META_KEY]: {hash, checkedAt: time}})
        checkedAt = time
        return false
      }
      const bytes = await readBytes('domains.json', MAX_BYTES, fetchFn)
      if ((await sha256(bytes)) !== next)
        throw new Error('Phishing feed hash mismatch')
      const raw = text(bytes),
        rules = prepare(raw)
      if (
        rules.allow.size !== stamp.allowed ||
        rules.block.size !== stamp.blocked ||
        (active &&
          (rules.block.size < active.block.size / 2 ||
            rules.allow.size < active.allow.size / 2))
      )
        throw new Error('Unexpected phishing feed counts')
      if (isLocked()) return false
      const time = now()
      await storage.set({
        [LIST_KEY]: raw,
        [META_KEY]: {hash: next, checkedAt: time},
      })
      active = rules
      hash = next
      checkedAt = time
      changes.dispatchEvent(new Event('updated'))
      return true
    } catch {
      lastFailure = now()
      return false
    }
  }
  function due(isLocked) {
    if (isLocked()) return Promise.resolve(false)
    const time = now()
    if (
      (active && time >= checkedAt && time - checkedAt < MAX_AGE) ||
      (lastFailure !== undefined &&
        time >= lastFailure &&
        time - lastFailure < RETRY_DELAY)
    )
      return Promise.resolve(false)
    if (!updating)
      updating = update(isLocked).finally(() => {
        updating = null
      })
    return updating
  }
  return {
    async refreshIfDue(isLocked) {
      await ready()
      return due(isLocked)
    },
    async checkOrigin(origin, isLocked, pendingSignal) {
      await ready()
      const verdict = active ? matchOrigin(origin, active) : UNKNOWN
      if (pendingSignal?.aborted || isLocked())
        return {verdict, rechecked: Promise.resolve(null)}
      // A still-open request can opt in to the next publication, even if its
      // own lookup was fresh. Aborting it detaches only that request.
      if (pendingSignal) {
        const rechecked = new Promise(resolve => {
          const finish = result => {
            changes.removeEventListener('updated', onUpdate)
            pendingSignal.removeEventListener('abort', onAbort)
            resolve(result)
          }
          const onUpdate = () =>
            finish(isLocked() ? null : matchOrigin(origin, active))
          const onAbort = () => finish(null)
          changes.addEventListener('updated', onUpdate)
          pendingSignal.addEventListener('abort', onAbort)
        })
        void due(isLocked)
        return {verdict, rechecked}
      }
      const rechecked = due(isLocked).then(changed =>
        changed && !isLocked() ? matchOrigin(origin, active) : null,
      )
      return {verdict, rechecked}
    },
  }
}
