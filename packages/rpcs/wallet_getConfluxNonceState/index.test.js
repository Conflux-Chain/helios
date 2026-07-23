import {beforeEach, describe, expect, test, vi} from 'vitest'
import {decodeCfxRawTransaction} from '@fluent-wallet/signature'
import {main} from './index.js'

vi.mock('@fluent-wallet/signature', () => ({
  decodeCfxRawTransaction: vi.fn(),
}))

const ADDRESS = 'cfxtest:aak39z1fdm02v71y33znvaxwthh99skcp2s48zasbp'

const NETWORK = {
  type: 'cfx',
  netId: 1,
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('wallet_getConfluxNonceState', () => {
  test('returns txpool nonce and locally occupied nonces', async () => {
    decodeCfxRawTransaction.mockReturnValue({
      from: ADDRESS,
      nonce: 15n,
    })

    const txpool_nextNonce = vi.fn().mockResolvedValue('0xe')
    const cfx_getNextNonce = vi.fn()

    const result = await main({
      db: {
        getUnfinishedTx: vi.fn(() => [
          {
            tx: 'wallet-signed-conflux-transaction',
            address: {value: ADDRESS},
            network: NETWORK,
          },
        ]),
        getTxById: vi.fn(() => ({
          fromFluent: true,
          raw: 'wallet-signed-conflux-raw',
        })),
      },
      rpcs: {
        txpool_nextNonce,
        cfx_getNextNonce,
      },
      params: [ADDRESS],
    })

    expect(result).toEqual({
      networkPendingNonce: '0xe',
      occupiedNonces: ['0xf'],
    })

    expect(decodeCfxRawTransaction).toHaveBeenCalledWith(
      'wallet-signed-conflux-raw',
    )
    expect(txpool_nextNonce).toHaveBeenCalledWith({errorFallThrough: true}, [
      ADDRESS,
    ])
    expect(cfx_getNextNonce).not.toHaveBeenCalled()
  })

  test('falls back when txpool_nextNonce fails', async () => {
    const txpool_nextNonce = vi
      .fn()
      .mockRejectedValue(new Error('txpool_nextNonce unavailable'))
    const cfx_getNextNonce = vi.fn().mockResolvedValue('0x6')

    const result = await main({
      db: {
        getUnfinishedTx: vi.fn(() => []),
        getTxById: vi.fn(),
      },
      rpcs: {
        txpool_nextNonce,
        cfx_getNextNonce,
      },
      params: [ADDRESS],
    })

    expect(result).toEqual({
      networkPendingNonce: '0x6',
      occupiedNonces: [],
    })

    expect(txpool_nextNonce).toHaveBeenCalledWith({errorFallThrough: true}, [
      ADDRESS,
    ])
    expect(cfx_getNextNonce).toHaveBeenCalledWith(
      {
        errorFallThrough: true,
        _cacheConf: {type: null},
      },
      [ADDRESS],
    )
  })
})
