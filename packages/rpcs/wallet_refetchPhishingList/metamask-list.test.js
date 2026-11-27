import {expect, it} from 'vitest'
import {parseMetaMaskFullList, applyMetaMaskDiffs} from './metamask-list.js'

const cursor = 1795567388
const event = (url, timestamp, kind = 'blocklist', isRemoval = false) => ({
  targetList: `eth_phishing_detect_config.${kind}`,
  url,
  timestamp,
  isRemoval,
})
const current = {
  lists: {allowlist: new Set(), blocklist: new Set(['existing.test'])},
  cursor,
}

it('decodes a snapshot with the upstream cursor and shared domain-set shape', () => {
  expect(
    parseMetaMaskFullList({
      data: {
        lastUpdated: cursor,
        allowlist: [],
        blocklist: ['BAD.test.'],
      },
    }),
  ).toEqual({
    lists: {allowlist: new Set(), blocklist: new Set(['bad.test'])},
    cursor,
  })
})

it.each([
  null,
  {},
  {data: {lastUpdated: 'invalid'}},
  {data: {lastUpdated: cursor}},
])('rejects an invalid snapshot: %j', payload =>
  expect(() => parseMetaMaskFullList(payload)).toThrow(),
)

it('orders additions and removals while keeping the previous lists unchanged', () => {
  const diffs = Object.freeze([
    event('new.test', cursor + 2, 'blocklist', true),
    event('new.test', cursor + 1),
    event('new.test', cursor + 2),
    event('ok.test', cursor + 3, 'allowlist'),
    event('existing.test', cursor, 'blocklist', true),
  ])
  const updated = applyMetaMaskDiffs(current, diffs)
  expect(updated.lists.blocklist).toEqual(
    new Set(['existing.test', 'new.test']),
  )
  expect(updated.lists.allowlist).toEqual(new Set(['ok.test']))
  expect(updated.cursor).toBe(cursor + 3)
  expect(current.lists.blocklist).toEqual(new Set(['existing.test']))
  expect(current.lists.allowlist.size).toBe(0)
})

it('advances the cursor for ignored same-feed rules but not foreign feeds', () => {
  const updated = applyMetaMaskDiffs(current, [
    event('shared.test/path', cursor + 2, 'blocklistPaths'),
    {...event('foreign.test', cursor + 99), targetList: 'other.blocklist'},
  ])
  expect(updated).toEqual({...current, cursor: cursor + 2})
  expect(applyMetaMaskDiffs(current, [])).toEqual(current)
})

it('rejects malformed batches without partially applying earlier changes', () => {
  expect(() =>
    applyMetaMaskDiffs(current, [
      event('new.test', cursor + 1),
      {...event('invalid.test', cursor + 2), isRemoval: 'false'},
    ]),
  ).toThrow()
  expect(current.lists.blocklist).toEqual(new Set(['existing.test']))
})
