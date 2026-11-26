import {compileFeed, matchOrigin} from './domains.js'

const STORAGE_KEY = 'phishing.metaMaskDomains.v1'
export const FEED_URL =
  'https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/main/src/config.json'
export const SNAPSHOT_PATH = 'phishing/metamask-domains.json'
export const SYNC_MINUTES = 6 * 60
const MAX_BYTES = 12 * 1024 * 1024

// Bound decoded bytes as well as Content-Length (which may be absent or compressed).
export async function downloadFeed(url, fetchFn, etag) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 30000)
  try {
    const res = await fetchFn(url, {
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      redirect: 'error',
      cache: 'no-cache',
      signal: controller.signal,
      ...(etag ? {headers: {'If-None-Match': etag}} : {}),
    })
    if (res.status === 304 && etag) return null
    if (
      res.status !== 200 ||
      Number(res.headers.get('content-length')) > MAX_BYTES
    )
      throw new Error('Invalid phishing list response')
    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8', {fatal: true})
    const chunks = []
    let total = 0
    try {
      for (;;) {
        const {done, value} = await reader.read()
        if (done) break
        total += value.byteLength
        if (total > MAX_BYTES) throw new Error('Phishing list too large')
        chunks.push(decoder.decode(value, {stream: true}))
      }
      chunks.push(decoder.decode())
    } finally {
      reader.releaseLock()
    }
    return {feed: JSON.parse(chunks.join('')), etag: res.headers.get('etag')}
  } finally {
    controller.abort()
    clearTimeout(timer)
  }
}

// Refuse implausible partial downloads, including syntactically valid empty lists.
function prepare(feed) {
  const rules = compileFeed(feed)
  if (rules.allow.size < 20 || rules.block.size < 50000)
    throw new Error('Incomplete MetaMask list')
  return rules
}

export function createDomainService({storage, loadBundled, download}) {
  let active, etag, initializing, updating

  async function initialize() {
    try {
      const cached = (await storage.get(STORAGE_KEY))[STORAGE_KEY]
      if (cached) {
        active = prepare(cached.feed)
        etag = typeof cached.etag === 'string' ? cached.etag : null
        return
      }
    } catch {
      /* Storage unavailable or corrupt: use the packaged copy. */
    }
    active = prepare(await loadBundled())
  }
  function ready() {
    if (!active && !initializing)
      initializing = initialize().finally(() => {
        initializing = null
      })
    return initializing
  }
  async function update() {
    // A damaged local installation must still be able to recover from upstream.
    try {
      await ready()
    } catch {
      /* Neither local source was readable. */
    }
    const next = await download(etag)
    if (next === null) return 'unchanged'
    const rules = prepare(next.feed)
    if (
      active &&
      (rules.block.size < active.block.size / 2 ||
        rules.allow.size < active.allow.size / 2)
    )
      throw new Error('Unexpected phishing list shrinkage')
    // Store both lists in a single write. A failed write must not replace the
    // last-known-good matcher, even temporarily or after a worker restart.
    const feed = {
      version: 2,
      whitelist: [...rules.allow],
      blacklist: [...rules.block],
    }
    await storage.set({[STORAGE_KEY]: {feed, etag: next.etag}})
    active = rules
    etag = next.etag
    return 'updated'
  }
  return {
    async checkOrigin(origin) {
      try {
        await ready()
      } catch {
        return {status: 'unknown'}
      }
      return matchOrigin(origin, active)
    },
    refresh() {
      if (!updating)
        updating = update()
          .catch(() => 'unavailable')
          .finally(() => {
            updating = null
          })
      return updating
    },
  }
}
