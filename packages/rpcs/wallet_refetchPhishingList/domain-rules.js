// Host-only rules. Never turn a URL/path rule into a rule for its entire host.
const labels = /^[a-z0-9_-]+(?:\.[a-z0-9_-]+)*$/
const MAX_ENTRIES = 500000

export function normalizeRule(value) {
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
    const host = normalizeRule(value)
    if (host) hosts.add(host)
  }
  return hosts
}

export function buildDomainRules(domainList) {
  if (domainList?.version !== 2)
    throw new Error('Unsupported phishing list format')
  return {
    allow: normalizeList(domainList.whitelist),
    block: normalizeList(domainList.blacklist),
  }
}

export const serializeRules = ({allow, block}) => ({
  version: 2,
  whitelist: [...allow],
  blacklist: [...block],
})
function sameHosts(current, next) {
  if (current === next) return true
  if (current.size !== next.size) return false
  for (const host of current) {
    if (!next.has(host)) return false
  }
  return true
}

export function sameRules(current, next) {
  return Boolean(
    current &&
      sameHosts(current.allow, next.allow) &&
      sameHosts(current.block, next.block),
  )
}

// Apply domain rules at DNS-label boundaries, most specific first. IPs and
// single-label hosts are exact matches; never fall back to a top-level domain.
function findRule(host, rules) {
  if (rules.has(host)) return host
  if (/^[\d.]+$/.test(host) || host.startsWith('[')) return null
  for (
    let dot = host.indexOf('.');
    dot !== -1;
    dot = host.indexOf('.', dot + 1)
  ) {
    const parent = host.slice(dot + 1)
    if (!parent.includes('.')) break
    if (rules.has(parent)) return parent
  }
  return null
}

export function matchOrigin(origin, rules) {
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
  const allowed = findRule(host, rules.allow)
  if (allowed)
    return {status: 'allowlisted', hostname: host, matchedDomain: allowed}
  const blocked = findRule(host, rules.block)
  if (blocked)
    return {status: 'blocklisted', hostname: host, matchedDomain: blocked}
  return {status: 'no-match', hostname: host}
}
