import {beforeEach, describe, expect, test, vi} from 'vitest'
import {main} from './index.js'

const ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const OTHER_ADDRESS = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const CFX_ADDRESS = 'cfxtest:aak39z1fdm02v71y33znvaxwthh99skcp2s48zasbp'
const CHAIN_ID = '0x1'

const NETWORK = {
  type: 'eth',
  chainId: CHAIN_ID,
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('wallet_getEthereumNonceState', () => {
  test('returns network nonce and locally occupied nonces', async () => {
    const storedTransactions = {
      'regular-ethereum-transaction': {
        fromFluent: true,
        txPayload: {
          from: ADDRESS.toLowerCase(),
          nonce: '0x5',
        },
      },
      'eip-7702-transaction': {
        fromFluent: true,
        txPayload: {
          from: ADDRESS.toLowerCase(),
          nonce: '0x6',
          authorizationList: [
            {eip7702Authorization: {nonce: '0x7'}},
            {eip7702Authorization: {nonce: '0x8'}},
          ],
        },
      },
    }

    const eth_getTransactionCount = vi.fn().mockResolvedValue('0x4')

    const result = await main({
      db: {
        getUnfinishedTx: vi.fn(() => [
          {
            tx: 'regular-ethereum-transaction',
            address: {value: ADDRESS},
            network: NETWORK,
          },
          {
            tx: 'eip-7702-transaction',
            address: {value: ADDRESS.toLowerCase()},
            network: NETWORK,
          },
        ]),
        getTxById: vi.fn(transactionId => storedTransactions[transactionId]),
      },
      rpcs: {eth_getTransactionCount},
      params: [ADDRESS],
      network: NETWORK,
    })

    expect(result).toEqual({
      networkPendingNonce: '0x4',
      occupiedNonces: ['0x5', '0x6', '0x7', '0x8'],
    })

    expect(eth_getTransactionCount).toHaveBeenCalledWith(
      {
        errorFallThrough: true,
        _cacheConf: {type: null},
      },
      [ADDRESS, 'pending'],
    )
  })

  test('ignores transactions outside the requested nonce domain', async () => {
    const storedTransactions = {
      'non-wallet-signed-transaction': {
        fromFluent: false,
        raw: 'external-raw',
      },
      'transaction-without-payload': {
        fromFluent: true,
      },
    }

    const getTxById = vi.fn(transactionId => storedTransactions[transactionId])

    const result = await main({
      db: {
        getUnfinishedTx: vi.fn(() => [
          {
            tx: 'transaction-on-another-chain',
            address: {value: ADDRESS},
            network: {type: 'eth', chainId: '0x2'},
          },
          {
            tx: 'transaction-for-another-account',
            address: {value: OTHER_ADDRESS},
            network: NETWORK,
          },
          {
            tx: 'conflux-transaction',
            address: {value: CFX_ADDRESS},
            network: {type: 'cfx', netId: 1},
          },
          {
            tx: 'non-wallet-signed-transaction',
            address: {value: ADDRESS},
            network: NETWORK,
          },
          {
            tx: 'transaction-without-payload',
            address: {value: ADDRESS},
            network: NETWORK,
          },
        ]),
        getTxById,
      },
      rpcs: {
        eth_getTransactionCount: vi.fn().mockResolvedValue('0x4'),
      },
      params: [ADDRESS],
      network: NETWORK,
    })

    expect(result).toEqual({
      networkPendingNonce: '0x4',
      occupiedNonces: [],
    })
    expect(getTxById.mock.calls).toEqual([
      ['non-wallet-signed-transaction'],
      ['transaction-without-payload'],
    ])
  })
})
