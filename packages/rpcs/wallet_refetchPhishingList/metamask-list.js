import {parseDomainRule, createDomainSets} from './domain.js'

const LIST_PREFIX = 'eth_phishing_detect_config.'
const isValidTimestamp = n => Number.isSafeInteger(n) && n > 0

export function parseMetaMaskFullList(payload) {
  const data = payload?.data
  if (!isValidTimestamp(data?.lastUpdated))
    throw new Error('Invalid MetaMask full list')
  return {
    lists: createDomainSets(data),
    cursor: data.lastUpdated,
  }
}

// The cursor is an upstream event time in seconds, never the device clock.
// All rows are compared with the starting cursor so timestamp ties stay ordered.
export function applyMetaMaskDiffs(base, diffs) {
  if (!Array.isArray(diffs)) throw new Error('Invalid MetaMask diffs')
  let cursor = base.cursor
  const changes = []
  for (const row of diffs) {
    if (
      !isValidTimestamp(row?.timestamp) ||
      typeof row.targetList !== 'string' ||
      typeof row.url !== 'string' ||
      (row.isRemoval !== undefined && typeof row.isRemoval !== 'boolean')
    )
      throw new Error('Invalid MetaMask diff')
    if (row.timestamp <= base.cursor || !row.targetList.startsWith(LIST_PREFIX))
      continue

    // Ignored rules (e.g. paths and fuzzy matches) still advance the feed cursor.
    cursor = Math.max(cursor, row.timestamp)
    const list = row.targetList.slice(LIST_PREFIX.length)
    if (list !== 'allowlist' && list !== 'blocklist') continue
    const host = parseDomainRule(row.url)
    if (host)
      changes.push({
        list,
        host,
        remove: row.isRemoval,
        timestamp: row.timestamp,
      })
  }

  if (!changes.length) return {lists: base.lists, cursor}
  // Work on a copy so a rejected response or failed storage write keeps the old list.
  const lists = {
    allowlist: new Set(base.lists.allowlist),
    blocklist: new Set(base.lists.blocklist),
  }
  changes.sort((a, b) => a.timestamp - b.timestamp)
  for (const {list, host, remove} of changes) {
    if (remove) lists[list].delete(host)
    else lists[list].add(host)
  }
  return {lists, cursor}
}
