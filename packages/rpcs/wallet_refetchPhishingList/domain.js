// Only list hostnames. A URL with a path must not match the entire host.
const labels = /^[a-z0-9_-]+(?:\.[a-z0-9_-]+)*$/
const MAX_ENTRIES = 500000
export const DOMAIN_LIST_VERSION = 1

export function normalizeDomain(value) {
  if (typeof value !== 'string') throw new Error('Invalid phishing list entry')
  if (!value || value.length > 1024 || /[\s\\/@:?#%*]/u.test(value)) return null
  let host = value.toLowerCase().replace(/\.$/, '')
  if (/\P{ASCII}/u.test(host)) {
    try {
      host = new URL(`https://${host}`).hostname
    } catch {
      return null
    }
  }
  if (
    !labels.test(host) ||
    host.length > 253 ||
    host.split('.').some(label => label.length > 63)
  )
    return null
  if (!host.includes('.') && host !== 'localhost') return null
  return host
}

function normalizeList(entries) {
  if (!Array.isArray(entries) || entries.length > MAX_ENTRIES)
    throw new Error('Invalid phishing list size')
  const hosts = new Set()
  for (const value of entries) {
    const host = normalizeDomain(value)
    if (host) hosts.add(host)
  }
  return hosts
}

// Turn downloaded or cached arrays into sets of normalized hostnames for local matching.
export function normalizeDomainLists(domainList) {
  if (domainList?.version !== DOMAIN_LIST_VERSION)
    throw new Error('Unsupported phishing list format')
  return {
    allow: normalizeList(domainList.whitelist),
    block: normalizeList(domainList.blacklist),
  }
}

// Convert the in-memory sets back to versioned arrays for storage; the caller writes them.
export const serializeDomainLists = ({allow, block}) => ({
  version: DOMAIN_LIST_VERSION,
  whitelist: [...allow],
  blacklist: [...block],
})
function haveSameDomains(current, next) {
  if (current === next) return true
  if (current.size !== next.size) return false
  for (const host of current) {
    if (!next.has(host)) return false
  }
  return true
}

export function areDomainListsEqual(current, next) {
  return Boolean(
    current &&
      haveSameDomains(current.allow, next.allow) &&
      haveSameDomains(current.block, next.block),
  )
}

// Match whole DNS labels, most specific first. IPs and
// single-label hosts are exact matches; never fall back to a top-level domain.
function findListedDomain(host, listedDomains) {
  if (listedDomains.has(host)) return host
  if (/^[\d.]+$/.test(host) || host.startsWith('[')) return null
  for (
    let dot = host.indexOf('.');
    dot !== -1;
    dot = host.indexOf('.', dot + 1)
  ) {
    const parent = host.slice(dot + 1)
    if (!parent.includes('.')) break
    if (listedDomains.has(parent)) return parent
  }
  return null
}

export function matchOrigin(origin, domainLists) {
  let host
  try {
    if (typeof origin !== 'string') return {status: 'unknown'}
    const url = new URL(origin)
    if (url.protocol !== 'https:' && url.protocol !== 'http:')
      return {status: 'unknown'}
    host = url.hostname.toLowerCase().replace(/\.$/, '')
    if (
      !host ||
      host.length > 253 ||
      host.split('.').some(label => !label || label.length > 63)
    )
      return {status: 'unknown'}
  } catch {
    return {status: 'unknown'}
  }
  const allowed = findListedDomain(host, domainLists.allow)
  if (allowed)
    return {status: 'allowlisted', hostname: host, matchedDomain: allowed}
  const blocked = findListedDomain(host, domainLists.block)
  if (blocked)
    return {status: 'blocklisted', hostname: host, matchedDomain: blocked}
  return {status: 'no-match', hostname: host}
}
