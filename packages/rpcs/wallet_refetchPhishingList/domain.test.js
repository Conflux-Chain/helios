import {describe, expect, it, vi} from 'vitest'
import {createDomainSets, getOriginVerdict} from './domain.js'

const emptyLists = createDomainSets({allowlist: [], blocklist: []})
const checkFluentList = (origin, lists) =>
  getOriginVerdict(origin, {fluent: lists, metaMask: emptyLists})

const domainLists = createDomainSets({
  allowlist: ['accounts.flagged.test', 'both.test', 'localhost'],
  blocklist: [
    'flagged.test',
    'both.test',
    'node.accounts.flagged.test',
    'BÜCHER.test.',
    '192.0.2.1',
    'shared.test/example',
    'https://another.test/path',
  ],
  fuzzylist: ['brand.test'],
})

describe('Source policy', () => {
  const fluent = createDomainSets({
    allowlist: ['allowed.test', 'both.test'],
    blocklist: ['blocked.test', 'both.test'],
  })
  const metaMask = createDomainSets({
    allowlist: ['blocked.test', 'mm-allowed.test'],
    blocklist: ['allowed.test', 'mm-blocked.test'],
  })

  it.each([
    ['blocked.test', 'blocklisted'],
    ['allowed.test', 'allowlisted'],
    ['both.test', 'allowlisted'],
    ['mm-allowed.test', 'allowlisted'],
    ['mm-blocked.test', 'blocklisted'],
    ['other.test', 'no-match'],
  ])('checks %s using Fluent policy before MetaMask', (host, status) => {
    expect(getOriginVerdict(`https://${host}`, {fluent, metaMask}).status).toBe(
      status,
    )
  })

  it('does not look in MetaMask after a Fluent hit', () => {
    const mm = createDomainSets({
      allowlist: ['blocked.test'],
      blocklist: ['allowed.test'],
    })
    const allowLookup = vi.spyOn(mm.allowlist, 'has')
    const blockLookup = vi.spyOn(mm.blocklist, 'has')
    expect(
      getOriginVerdict('https://blocked.test', {fluent, metaMask: mm}).status,
    ).toBe('blocklisted')
    expect(
      getOriginVerdict('https://allowed.test', {fluent, metaMask: mm}).status,
    ).toBe('allowlisted')
    expect(allowLookup).not.toHaveBeenCalled()
    expect(blockLookup).not.toHaveBeenCalled()
  })

  it.each(['fluent', 'metaMask'])(
    'uses known matches but returns unknown for misses with only %s loaded',
    source => {
      const lists = createDomainSets({
        allowlist: [],
        blocklist: ['blocked.test'],
      })
      expect(
        getOriginVerdict('https://blocked.test', {[source]: lists}).status,
      ).toBe('blocklisted')
      expect(getOriginVerdict('https://other.test', {[source]: lists})).toEqual(
        {status: 'unknown'},
      )
    },
  )
})

describe('Domain rules', () => {
  it.each(['\u3002', '\uFF0E', '\uFF61'])(
    'matches list entries ending in the Unicode root dot %s',
    dot => {
      const lists = createDomainSets({
        allowlist: [`ok.bücher.test${dot}`],
        blocklist: [`bücher.test${dot}`],
      })
      expect(checkFluentList('https://xn--bcher-kva.test', lists).status).toBe(
        'blocklisted',
      )
      expect(
        checkFluentList(`https://ok.bücher.test${dot}`, lists).status,
      ).toBe('allowlisted')
    },
  )
  it('does not turn two trailing dots into a valid list entry', () => {
    const lists = createDomainSets({
      allowlist: [],
      blocklist: ['bücher.test\u3002.'],
    })
    expect(checkFluentList('https://bücher.test', lists).status).toBe(
      'no-match',
    )
  })
  it('normalizes and deduplicates domains before matching', () => {
    const lists = createDomainSets({
      allowlist: [],
      blocklist: ['BAD.test.', 'bad.test'],
    })
    expect(lists.blocklist).toEqual(new Set(['bad.test']))
    expect(checkFluentList('https://sub.bad.test', lists)).toEqual({
      status: 'blocklisted',
      hostname: 'sub.bad.test',
      matchedDomain: 'bad.test',
    })
  })
  it.each([
    ['https://FLAGGED.test.:8443/x?q=1', 'blocklisted', 'flagged.test'],
    ['http://sub.flagged.test', 'blocklisted', 'flagged.test'],
    ['https://both.test', 'allowlisted', 'both.test'],
    [
      'https://node.accounts.flagged.test',
      'allowlisted',
      'accounts.flagged.test',
    ],
    ['https://xn--bcher-kva.test', 'blocklisted', 'xn--bcher-kva.test'],
    ['https://bücher.test', 'blocklisted', 'xn--bcher-kva.test'],
    ['http://192.0.2.1:8000', 'blocklisted', '192.0.2.1'],
    ['http://localhost:3000', 'allowlisted', 'localhost'],
  ])(
    'matches %s using host-label boundaries and allowlist precedence',
    (url, status, matchedDomain) => {
      expect(checkFluentList(url, domainLists)).toMatchObject({
        status,
        matchedDomain,
      })
    },
  )

  it.each([
    'https://notflagged.test',
    'https://flagged.test.neutral.test',
    'https://flagged.test@neutral.test/path',
    'https://neutral.test/flagged.test',
    'https://shared.test/example',
    'https://another.test',
    'https://brand.test',
    'http://192.0.2.10',
  ])('does not widen a listed domain to match %s', url => {
    expect(checkFluentList(url, domainLists).status).toBe('no-match')
  })

  it.each([
    null,
    'not an origin',
    'file:///example',
    'chrome-extension://id/page',
    'about:blank',
    'data:text/plain,example',
  ])('returns unknown for unsupported input %s', input => {
    expect(checkFluentList(input, domainLists)).toEqual({status: 'unknown'})
  })
})
