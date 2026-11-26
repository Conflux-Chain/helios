import {expect, it, vi} from 'vitest'
import {withDomainRefresh} from './background.js'

it('starts a due check on the internal after-unlock path without delaying its normal result', async () => {
  const existing = {
    NAME: 'wallet_afterUnlock',
    permissions: {external: [], db: ['getNetwork']},
    main: vi.fn(async () => 'done'),
  }
  const refresh = vi.fn(() => new Promise(() => {}))
  const rpc = withDomainRefresh(existing, refresh)
  const args = {db: {getLocked: () => false}}
  expect(await rpc.main(args)).toBe('done')
  expect(existing.main).toHaveBeenCalledWith(args)
  expect(refresh).toHaveBeenCalledWith(args.db.getLocked)
  expect(rpc.permissions).toEqual({
    external: [],
    db: ['getNetwork', 'getLocked'],
  })
  expect(existing.permissions.db).toEqual(['getNetwork'])
})
