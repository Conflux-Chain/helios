const DNS_HOSTNAME = /^(?:[a-z0-9_-]+\.)+[a-z0-9_-]+$/u

function getSupportedHostname(url) {
  const host = url.hostname.replace(/\.$/, '')
  return host === 'localhost' || DNS_HOSTNAME.test(host) ? host : null
}

// Entries are bare DNS names, IPv4 addresses or localhost, never URLs or paths.
export function parseDomainRule(value) {
  if (/[\s\\/@:?#%*]/u.test(value)) return null
  try {
    // Use the same URL normalization as origins, including IDNA and IPv4 forms.
    return getSupportedHostname(new URL(`https://${value}`))
  } catch {
    return null
  }
}

function createDomainSet(entries) {
  if (!Array.isArray(entries)) throw new Error('Expected an array of domains')
  const hosts = new Set()
  for (const value of entries) {
    if (typeof value !== 'string')
      throw new Error('Invalid phishing list entry')
    const host = parseDomainRule(value)
    if (host) hosts.add(host)
  }
  return hosts
}

// Source adapters supply arrays; matching always uses these two normalized sets.
export function createDomainSets(lists) {
  return {
    allowlist: createDomainSet(lists?.allowlist),
    blocklist: createDomainSet(lists?.blocklist),
  }
}

// The host itself, then DNS parents; exclude top-level domains. IPv4 is exact-only.
function getDomainCandidates(host) {
  const candidates = [host]
  if (/^[\d.]+$/.test(host)) return candidates
  const labels = host.split('.')
  for (let i = 1; i < labels.length - 1; i++) {
    candidates.push(labels.slice(i).join('.'))
  }
  return candidates
}

function parseOriginHostname(origin) {
  try {
    if (typeof origin !== 'string') return null
    const url = new URL(origin)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    return getSupportedHostname(url)
  } catch {
    return null
  }
}

export function getOriginVerdict(origin, {fluent, metaMask}) {
  const hostname = parseOriginHostname(origin)
  if (!hostname) return {status: 'unknown'}
  const candidates = getDomainCandidates(hostname)

  function match(lists) {
    if (!lists) return null
    const allowed = candidates.find(domain => lists.allowlist.has(domain))
    if (allowed)
      return {status: 'allowlisted', hostname, matchedDomain: allowed}
    const blocked = candidates.find(domain => lists.blocklist.has(domain))
    if (blocked)
      return {status: 'blocklisted', hostname, matchedDomain: blocked}
    return null
  }

  const fluentMatch = match(fluent)
  if (fluentMatch) return fluentMatch
  const metaMaskMatch = match(metaMask)
  if (metaMaskMatch) return metaMaskMatch
  return fluent && metaMask
    ? {status: 'no-match', hostname}
    : {status: 'unknown'}
}
