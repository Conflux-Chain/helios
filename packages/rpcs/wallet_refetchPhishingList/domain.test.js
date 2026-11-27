import {describe, expect, it} from 'vitest'
import {
  toDomainListsForMatching,
  toDomainListsForStorage,
  matchOrigin,
} from './domain.js'

const domainLists = toDomainListsForMatching({
  version: 1,
  whitelist: ['accounts.flagged.test', 'both.test', 'localhost'],
  blacklist: [
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

describe('MetaMask domain lists', () => {
  it('keeps the same verdict when matching sets are stored as arrays and restored', () => {
    const origin = 'https://sub.bad.test'
    const forMatching = toDomainListsForMatching({
      version: 1,
      whitelist: [],
      blacklist: ['BAD.test.', 'bad.test'],
    })
    const forStorage = toDomainListsForStorage(forMatching)
    expect(forStorage).toEqual({
      version: 1,
      whitelist: [],
      blacklist: ['bad.test'],
    })
    expect(forMatching.block).toEqual(new Set(['bad.test']))
    const restored = toDomainListsForMatching(forStorage)
    expect(matchOrigin(origin, restored)).toEqual({
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
      expect(matchOrigin(url, domainLists)).toMatchObject({
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
    expect(matchOrigin(url, domainLists).status).toBe('no-match')
  })

  it.each([
    null,
    'not an origin',
    'file:///example',
    'chrome-extension://id/page',
    'about:blank',
    'data:text/plain,example',
  ])('returns unknown for unsupported input %s', input => {
    expect(matchOrigin(input, domainLists)).toEqual({status: 'unknown'})
  })
})
