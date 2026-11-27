import {expect, it, vi} from 'vitest'
import {main, permissions} from './index.js'

it.each([true, false])(
  'explicitly schedules phishing refresh and preserves the token list sequence (dispatch succeeds: %s)',
  async ok => {
    const order = []
    const args = {
      params: {waitSideEffects: true},
      db: {
        getNetwork: () => [],
        getAccountGroup: () => [{eid: 42, vault: {type: 'hd'}, account: []}],
      },
      rpcs: {
        wallet_refetchPhishingList: vi.fn(async () => {
          order.push('phishing')
          if (!ok) throw new Error('relocked')
        }),
        wallet_refetchTokenList: vi.fn(async () => {
          order.push('tokens')
        }),
        wallet_discoverAccounts: vi.fn(async () => {
          order.push('accounts')
        }),
        wallet_refetchBalance: vi.fn(async () => {
          order.push('balances')
        }),
      },
    }
    expect(permissions.methods).toContain('wallet_refetchPhishingList')
    await main(args)
    expect(args.rpcs.wallet_refetchPhishingList).toHaveBeenCalledWith(
      {errorFallThrough: true},
      undefined,
    )
    expect(order).toEqual(['phishing', 'tokens', 'accounts', 'balances'])
  },
)
