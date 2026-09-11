import {describe, expect, test, vi} from 'vitest'
import {main} from './index.js'

const APP_ID = 1
const BUNDLE_ID = 'bundle-1'
const CHAIN_ID = '0x47'

const BLOCK_HASH =
  '0x1111111111111111111111111111111111111111111111111111111111111111'
const TRANSACTION_HASH =
  '0x2222222222222222222222222222222222222222222222222222222222222222'

const LOG = {
  address: '0x3333333333333333333333333333333333333333',
  data: '0x1234',
  topics: [
    '0x4444444444444444444444444444444444444444444444444444444444444444',
  ],
}

const Err = {
  Internal: message => new Error(message),
  InvalidParams: message => new Error(message),
  UnknownBundleId: message => new Error(message),
}

function callMain(record) {
  const getCallBundleRecords = vi.fn(() => [record])

  const result = main({
    Err,
    db: {getCallBundleRecords},
    params: [BUNDLE_ID],
    app: {eid: APP_ID},
  })

  return {result, getCallBundleRecords}
}

describe('wallet_getCallsStatus', () => {
  test('returns a confirmed transaction receipt for the current app', () => {
    const {result, getCallBundleRecords} = callMain({
      type: 'transaction',
      record: {
        hash: TRANSACTION_HASH,
        status: 5,
        txPayload: {
          chainId: CHAIN_ID,
        },
        receipt: {
          status: '0x1',
          blockHash: BLOCK_HASH,
          blockNumber: '0x10',
          gasUsed: '0x5208',
          logs: [{...LOG, logIndex: '0x0'}],
        },
      },
    })

    expect(result).toEqual({
      version: '2.0.0',
      id: BUNDLE_ID,
      chainId: CHAIN_ID,
      atomic: true,
      status: 200,
      receipts: [
        {
          status: '0x1',
          blockHash: BLOCK_HASH,
          blockNumber: '0x10',
          gasUsed: '0x5208',
          transactionHash: TRANSACTION_HASH,
          logs: [LOG],
        },
      ],
    })

    expect(getCallBundleRecords).toHaveBeenCalledWith({
      appId: APP_ID,
      bundleId: BUNDLE_ID,
    })
  })

  test('returns the current UserOperation revert and its own logs', () => {
    const {result} = callMain({
      type: 'userOperation',
      record: {
        chainId: CHAIN_ID,
        status: 'included',
        success: false,
        receipt: {
          actualGasUsed: '0x6000',
          logs: [LOG],
          receipt: {
            blockHash: BLOCK_HASH,
            blockNumber: '0x11',
            transactionHash: TRANSACTION_HASH,
            logs: [],
          },
        },
      },
    })

    expect(result).toEqual({
      version: '2.0.0',
      id: BUNDLE_ID,
      chainId: CHAIN_ID,
      atomic: true,
      status: 500,
      receipts: [
        {
          status: '0x0',
          blockHash: BLOCK_HASH,
          blockNumber: '0x11',
          gasUsed: '0x6000',
          transactionHash: TRANSACTION_HASH,
          logs: [LOG],
        },
      ],
    })
  })

  test.each([
    [
      'a pending transaction',
      {
        type: 'transaction',
        record: {
          status: 2,
          txPayload: {chainId: CHAIN_ID},
        },
      },
      100,
    ],
    [
      'a failed transaction without a receipt',
      {
        type: 'transaction',
        record: {
          status: -1,
          txPayload: {chainId: CHAIN_ID},
        },
      },
      400,
    ],
    [
      'a pending UserOperation',
      {
        type: 'userOperation',
        record: {
          status: 'pending',
          chainId: CHAIN_ID,
        },
      },
      100,
    ],
    [
      'a failed UserOperation',
      {
        type: 'userOperation',
        record: {
          status: 'failed',
          chainId: CHAIN_ID,
        },
      },
      400,
    ],
  ])('maps %s without a receipt', (_name, record, status) => {
    const {result} = callMain(record)

    expect(result).toEqual({
      version: '2.0.0',
      id: BUNDLE_ID,
      chainId: CHAIN_ID,
      atomic: true,
      status,
    })
  })
})
