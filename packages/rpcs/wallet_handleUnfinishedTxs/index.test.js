import {describe, expect, test, vi} from 'vitest'
import {main} from './index.js'

describe('wallet_handleUnfinishedTxs', () => {
  test('resumes unfinished UserOperations on their original networks', () => {
    const wallet_handleUserOperation = vi.fn().mockResolvedValue()

    main({
      db: {
        getUnfinishedTx: vi.fn(() => []),
        getUnfinishedUserOperations: vi.fn(() => [
          {hash: '0x01', networkId: 11},
          {hash: '0x02', networkId: 22},
        ]),
      },
      rpcs: {
        wallet_handleUnfinishedCFXTx: vi.fn(),
        wallet_handleUnfinishedETHTx: vi.fn(),
        wallet_handleUserOperation,
      },
    })

    expect(wallet_handleUserOperation).toHaveBeenCalledTimes(2)
    expect(wallet_handleUserOperation).toHaveBeenNthCalledWith(
      1,
      {errorFallThrough: true},
      {hash: '0x01', networkId: 11},
    )
    expect(wallet_handleUserOperation).toHaveBeenNthCalledWith(
      2,
      {errorFallThrough: true},
      {hash: '0x02', networkId: 22},
    )
  })
})
