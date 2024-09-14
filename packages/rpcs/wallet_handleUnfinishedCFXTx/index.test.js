import {expect, describe, test, vi, beforeEach} from 'vitest'
import waitForExpect from 'wait-for-expect'
import {mergeDeepObj} from '@thi.ng/associative'
import {main} from './index.js'

let defaultInputs

beforeEach(() => {
  defaultInputs = {
    rpcs: {
      cfx_epochNumber: vi.fn(() => Promise.resolve()),
      cfx_sendRawTransaction: vi.fn(() => Promise.resolve()),
      cfx_getTransactionByHash: vi.fn(() => Promise.resolve()),
      cfx_getTransactionReceipt: vi.fn(() => Promise.resolve()),
      cfx_getNextNonce: vi.fn(() => Promise.resolve()),
      wallet_getBlockchainExplorerUrl: vi.fn(() =>
        Promise.resolve({transaction: ['tx']}),
      ),
      wallet_handleUnfinishedCFXTx: vi.fn(() => Promise.resolve()),
    },
    db: {
      retractAttr: vi.fn(),
      getUnfinishedTxCount: vi.fn(() => 0),
      getAddressById: vi.fn(() => ({
        eid: 'addreid',
        value: 'addr',
        hex: 'addr',
      })),
      getTxById: vi.fn(() => ({
        eid: 'txeid',
        status: 0,
        hash: 'txhash',
        raw: 'txraw',
        txPayload: {nonce: 'txnonce', epochHeight: '0x1'},
      })),
      setTxSkipped: vi.fn(),
      setTxFailed: vi.fn(),
      setTxSending: vi.fn(),
      setTxPending: vi.fn(),
      setTxPackaged: vi.fn(),
      setTxExecuted: vi.fn(),
      setTxConfirmed: vi.fn(),
      setTxUnsent: vi.fn(),
      setTxChainSwitched: vi.fn(),
    },
    params: {
      tx: 'txid',
      address: 'addr',
      okCb: vi.fn(),
      failedCb: vi.fn(),
    },
    network: {cacheTime: 0},
  }
})

describe('wallet_handleUnfinishedCFXTx', () => {
  describe('unsent', () => {
    test('success', async () => {
      const inputs = mergeDeepObj(defaultInputs, {
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
          })),
        },
      })

      main(inputs)
      await waitForExpect(() =>
        expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(
          1,
        ),
      )

      expect(inputs.db.setTxSending).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxSending).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(1)
      expect(inputs.db.getUnfinishedTxCount).toHaveBeenLastCalledWith()

      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txraw'],
      )

      expect(inputs.db.setTxPending).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxPending).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.params.okCb).toHaveBeenCalledTimes(1)
      expect(inputs.params.okCb).toHaveBeenLastCalledWith('txhash')

      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenLastCalledWith(
        {
          tx: 'txeid',
          address: 'addreid',
        },
      )
    })

    test('Error in sendRawTx tx already exist, should similar to success', async () => {
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_sendRawTransaction: vi.fn(() =>
            Promise.reject({data: 'tx already exist'}),
          ),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
          })),
        },
      })

      main(inputs)
      await waitForExpect(() =>
        expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(
          1,
        ),
      )

      expect(inputs.db.setTxSending).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxSending).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(1)
      expect(inputs.db.getUnfinishedTxCount).toHaveBeenLastCalledWith()

      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txraw'],
      )

      expect(inputs.db.setTxPending).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxPending).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.params.okCb).toHaveBeenCalledTimes(1)
      expect(inputs.params.okCb).toHaveBeenLastCalledWith('txhash')

      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenLastCalledWith(
        {
          tx: 'txeid',
          address: 'addreid',
        },
      )
    })
    test('Error in sendRawTx tx pool is full', async () => {
      const err = {data: 'tx pool is full'}
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_sendRawTransaction: vi.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      main(inputs)
      await waitForExpect(() =>
        expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2),
      )

      expect(inputs.db.setTxSending).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxSending).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2)
      expect(inputs.db.getUnfinishedTxCount).toHaveBeenLastCalledWith()

      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txraw'],
      )

      expect(inputs.params.okCb).toHaveBeenCalledTimes(0)

      expect(inputs.db.setTxUnsent).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxUnsent).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.params.failedCb).toHaveBeenCalledTimes(1)
      expect(inputs.params.failedCb).toHaveBeenLastCalledWith(err)

      expect(inputs.db.setTxFailed).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxFailed).toHaveBeenLastCalledWith({
        hash: 'txhash',
        error: 'txPoolFull',
      })

      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(0)
    })
    test('Error in sendRawTx Transaction Pool is full', async () => {
      const err = {data: 'Transaction Pool is full'}
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_sendRawTransaction: vi.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      main(inputs)
      await waitForExpect(() =>
        expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2),
      )

      expect(inputs.db.setTxSending).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxSending).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2)
      expect(inputs.db.getUnfinishedTxCount).toHaveBeenLastCalledWith()

      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txraw'],
      )

      expect(inputs.params.okCb).toHaveBeenCalledTimes(0)

      expect(inputs.db.setTxUnsent).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxUnsent).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.params.failedCb).toHaveBeenCalledTimes(1)
      expect(inputs.params.failedCb).toHaveBeenLastCalledWith(err)

      expect(inputs.db.setTxFailed).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxFailed).toHaveBeenLastCalledWith({
        hash: 'txhash',
        error: 'txPoolFull',
      })

      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(0)
    })
    test('Error in sendRawTx still in the catch up mode', async () => {
      const err = {data: 'still in the catch up mode'}
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_sendRawTransaction: vi.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      main(inputs)
      await waitForExpect(() =>
        expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2),
      )

      expect(inputs.db.setTxSending).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxSending).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2)
      expect(inputs.db.getUnfinishedTxCount).toHaveBeenLastCalledWith()

      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txraw'],
      )

      expect(inputs.params.okCb).toHaveBeenCalledTimes(0)

      expect(inputs.db.setTxUnsent).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxUnsent).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.params.failedCb).toHaveBeenCalledTimes(1)
      expect(inputs.params.failedCb).toHaveBeenLastCalledWith(err)

      expect(inputs.db.setTxFailed).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxFailed).toHaveBeenLastCalledWith({
        hash: 'txhash',
        error: 'nodeInCatchUpMode',
      })

      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(0)
    })
    test('Error in sendRawTx Can not recover pubkey', async () => {
      const err = {data: 'Can not recover pubkey'}
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_sendRawTransaction: vi.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      main(inputs)
      await waitForExpect(() =>
        expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2),
      )

      expect(inputs.db.setTxSending).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxSending).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2)
      expect(inputs.db.getUnfinishedTxCount).toHaveBeenLastCalledWith()

      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txraw'],
      )

      expect(inputs.params.okCb).toHaveBeenCalledTimes(0)

      expect(inputs.db.setTxUnsent).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxUnsent).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.params.failedCb).toHaveBeenCalledTimes(1)
      expect(inputs.params.failedCb).toHaveBeenLastCalledWith(err)

      expect(inputs.db.setTxFailed).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxFailed).toHaveBeenLastCalledWith({
        hash: 'txhash',
        error: 'canNotRecoverPubKey',
      })

      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(0)
    })
    test('Error in sendRawTx RlpIncorrectListLen', async () => {
      const err = {data: 'RlpIncorrectListLen'}
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_sendRawTransaction: vi.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      main(inputs)
      await waitForExpect(() =>
        expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2),
      )

      expect(inputs.db.setTxSending).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxSending).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2)
      expect(inputs.db.getUnfinishedTxCount).toHaveBeenLastCalledWith()

      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txraw'],
      )

      expect(inputs.params.okCb).toHaveBeenCalledTimes(0)

      expect(inputs.db.setTxUnsent).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxUnsent).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.params.failedCb).toHaveBeenCalledTimes(1)
      expect(inputs.params.failedCb).toHaveBeenLastCalledWith(err)

      expect(inputs.db.setTxFailed).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxFailed).toHaveBeenLastCalledWith({
        hash: 'txhash',
        error: 'rlpIncorrectListLen',
      })

      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(0)
    })
    test('Error in sendRawTx ChainIdMismatch', async () => {
      const err = {data: 'ChainIdMismatch'}
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_sendRawTransaction: vi.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      main(inputs)
      await waitForExpect(() =>
        expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2),
      )

      expect(inputs.db.setTxSending).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxSending).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2)
      expect(inputs.db.getUnfinishedTxCount).toHaveBeenLastCalledWith()

      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txraw'],
      )

      expect(inputs.params.okCb).toHaveBeenCalledTimes(0)

      expect(inputs.db.setTxUnsent).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxUnsent).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.params.failedCb).toHaveBeenCalledTimes(1)
      expect(inputs.params.failedCb).toHaveBeenLastCalledWith(err)

      expect(inputs.db.setTxFailed).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxFailed).toHaveBeenLastCalledWith({
        hash: 'txhash',
        error: 'chainIdMismatch',
      })

      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(0)
    })
    test('Error in sendRawTx ZeroGasPrice', async () => {
      const err = {data: 'ZeroGasPrice'}
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_sendRawTransaction: vi.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      main(inputs)
      await waitForExpect(() =>
        expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2),
      )

      expect(inputs.db.setTxSending).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxSending).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2)
      expect(inputs.db.getUnfinishedTxCount).toHaveBeenLastCalledWith()

      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txraw'],
      )

      expect(inputs.params.okCb).toHaveBeenCalledTimes(0)

      expect(inputs.db.setTxUnsent).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxUnsent).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.params.failedCb).toHaveBeenCalledTimes(1)
      expect(inputs.params.failedCb).toHaveBeenLastCalledWith(err)

      expect(inputs.db.setTxFailed).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxFailed).toHaveBeenLastCalledWith({
        hash: 'txhash',
        error: 'zeroGasPrice',
      })

      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(0)
    })
    test('Error in sendRawTx too distant future', async () => {
      const err = {data: 'too distant future'}
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_sendRawTransaction: vi.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      main(inputs)
      await waitForExpect(() =>
        expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2),
      )

      expect(inputs.db.setTxSending).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxSending).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2)
      expect(inputs.db.getUnfinishedTxCount).toHaveBeenLastCalledWith()

      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txraw'],
      )

      expect(inputs.params.okCb).toHaveBeenCalledTimes(0)

      expect(inputs.db.setTxUnsent).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxUnsent).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.params.failedCb).toHaveBeenCalledTimes(1)
      expect(inputs.params.failedCb).toHaveBeenLastCalledWith(err)

      expect(inputs.db.setTxFailed).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxFailed).toHaveBeenLastCalledWith({
        hash: 'txhash',
        error: 'tooDistantFuture',
      })

      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(0)
    })
    test('Error in sendRawTx EpochHeightOutOfBound', async () => {
      const err = {data: 'EpochHeightOutOfBound'}
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_sendRawTransaction: vi.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      main(inputs)
      await waitForExpect(() =>
        expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2),
      )

      expect(inputs.db.setTxSending).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxSending).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2)
      expect(inputs.db.getUnfinishedTxCount).toHaveBeenLastCalledWith()

      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txraw'],
      )

      expect(inputs.params.okCb).toHaveBeenCalledTimes(0)

      expect(inputs.db.setTxUnsent).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxUnsent).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.params.failedCb).toHaveBeenCalledTimes(1)
      expect(inputs.params.failedCb).toHaveBeenLastCalledWith(err)

      expect(inputs.db.setTxFailed).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxFailed).toHaveBeenLastCalledWith({
        hash: 'txhash',
        error: 'epochHeightOutOfBound',
      })

      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(0)
    })
    test('Error in sendRawTx exceeds the maximum value', async () => {
      const err = {data: 'exceeds the maximum value'}
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_sendRawTransaction: vi.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      main(inputs)
      await waitForExpect(() =>
        expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2),
      )

      expect(inputs.db.setTxSending).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxSending).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2)
      expect(inputs.db.getUnfinishedTxCount).toHaveBeenLastCalledWith()

      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txraw'],
      )

      expect(inputs.params.okCb).toHaveBeenCalledTimes(0)

      expect(inputs.db.setTxUnsent).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxUnsent).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.params.failedCb).toHaveBeenCalledTimes(1)
      expect(inputs.params.failedCb).toHaveBeenLastCalledWith(err)

      expect(inputs.db.setTxFailed).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxFailed).toHaveBeenLastCalledWith({
        hash: 'txhash',
        error: 'gasExceedsLimit',
      })

      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(0)
    })
    test('Error in sendRawTx too stale nonce', async () => {
      const err = {data: 'too stale nonce'}
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_sendRawTransaction: vi.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      main(inputs)
      await waitForExpect(() =>
        expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2),
      )

      expect(inputs.db.setTxSending).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxSending).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2)
      expect(inputs.db.getUnfinishedTxCount).toHaveBeenLastCalledWith()

      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txraw'],
      )

      expect(inputs.params.okCb).toHaveBeenCalledTimes(0)

      expect(inputs.db.setTxUnsent).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxUnsent).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.params.failedCb).toHaveBeenCalledTimes(1)
      expect(inputs.params.failedCb).toHaveBeenLastCalledWith(err)

      expect(inputs.db.setTxFailed).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxFailed).toHaveBeenLastCalledWith({
        hash: 'txhash',
        error: 'tooStaleNonce',
      })

      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(0)
    })
    test('Error in sendRawTx same nonce already inserted replace gas price', async () => {
      const err = {data: 'same nonce already inserted replace gas price'}
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_sendRawTransaction: vi.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      main(inputs)
      await waitForExpect(() =>
        expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2),
      )

      expect(inputs.db.setTxSending).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxSending).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2)
      expect(inputs.db.getUnfinishedTxCount).toHaveBeenLastCalledWith()

      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txraw'],
      )

      expect(inputs.params.okCb).toHaveBeenCalledTimes(0)

      expect(inputs.db.setTxUnsent).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxUnsent).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.params.failedCb).toHaveBeenCalledTimes(1)
      expect(inputs.params.failedCb).toHaveBeenLastCalledWith(err)

      expect(inputs.db.setTxFailed).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxFailed).toHaveBeenLastCalledWith({
        hash: 'txhash',
        error: 'replacedWithHigherGasPriceTx',
      })

      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(0)
    })
    test('Error in sendRawTx unknownError uunnkknERRORnoowwnn', async () => {
      const err = {data: 'unknownError uunnkknERRORnoowwnn'}
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_sendRawTransaction: vi.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      main(inputs)
      await waitForExpect(() =>
        expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2),
      )

      expect(inputs.db.setTxSending).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxSending).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.db.getUnfinishedTxCount).toHaveBeenCalledTimes(2)
      expect(inputs.db.getUnfinishedTxCount).toHaveBeenLastCalledWith()

      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_sendRawTransaction).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txraw'],
      )

      expect(inputs.params.okCb).toHaveBeenCalledTimes(0)

      expect(inputs.db.setTxUnsent).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxUnsent).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.params.failedCb).toHaveBeenCalledTimes(1)
      expect(inputs.params.failedCb).toHaveBeenLastCalledWith(err)

      expect(inputs.db.setTxFailed).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxFailed).toHaveBeenLastCalledWith({
        hash: 'txhash',
        error: 'unknownError',
      })

      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(0)
    })
  })

  describe('sending', () => {
    test('nothing should be called', async () => {
      const inputs = mergeDeepObj(defaultInputs, {
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 1,
            hash: 'txhash',
            raw: 'txraw',
          })),
        },
      })

      main(inputs)
      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(0)
    })
  })

  describe('pending', () => {
    test('not packaged, not resend', async () => {
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_epochNumber: vi.fn(() => Promise.resolve('0x1')),
          cfx_getTransactionByHash: vi.fn(() => Promise.resolve(null)),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 2,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce', epochHeight: '0x1'},
          })),
        },
      })

      main(inputs)
      await waitForExpect(() =>
        expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(
          1,
        ),
      )

      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txhash'],
      )

      expect(inputs.rpcs.cfx_epochNumber).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_epochNumber).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['latest_state'],
      )

      expect(inputs.db.setTxUnsent).toHaveBeenCalledTimes(0)
    })
    test('not packaged, 40 epoch old', async () => {
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_epochNumber: vi.fn(() => Promise.resolve('0x29')), // decimal 41
          cfx_getTransactionByHash: vi.fn(() => Promise.resolve(null)),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 2,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce', epochHeight: '0x1'},
          })),
        },
      })

      main(inputs)
      await waitForExpect(() =>
        expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(
          1,
        ),
      )
      await waitForExpect(() =>
        expect(inputs.db.setTxUnsent).toHaveBeenCalledTimes(1),
      )

      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txhash'],
      )

      expect(inputs.rpcs.cfx_epochNumber).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_epochNumber).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['latest_state'],
      )

      expect(inputs.db.setTxUnsent).toHaveBeenLastCalledWith({
        hash: 'txhash',
        resendAt: '0x29',
      })
    })
    test('not packaged, resend at 40 epoch before', async () => {
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_epochNumber: vi.fn(() => Promise.resolve('0x51')), // decimal 81
          cfx_getTransactionByHash: vi.fn(() => Promise.resolve(null)),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 2,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {
              nonce: 'txnonce',
              epochHeight: '0x1',
              resendAt: '0x29',
            },
          })),
        },
      })

      main(inputs)
      await waitForExpect(() =>
        expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(
          1,
        ),
      )
      await waitForExpect(() =>
        expect(inputs.db.setTxUnsent).toHaveBeenCalledTimes(1),
      )

      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txhash'],
      )

      expect(inputs.rpcs.cfx_epochNumber).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_epochNumber).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['latest_state'],
      )

      expect(inputs.db.setTxUnsent).toHaveBeenLastCalledWith({
        hash: 'txhash',
        resendAt: '0x51',
      })
    })
    test('not packaged (no blockhash), not resend', async () => {
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_epochNumber: vi.fn(() => Promise.resolve('0x1')),
          cfx_getTransactionByHash: vi.fn(() => Promise.resolve({})),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 2,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce', epochHeight: '0x1'},
          })),
        },
      })

      main(inputs)
      await waitForExpect(() =>
        expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(
          1,
        ),
      )

      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txhash'],
      )

      expect(inputs.rpcs.cfx_epochNumber).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_epochNumber).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['latest_state'],
      )

      expect(inputs.db.setTxUnsent).toHaveBeenCalledTimes(0)
    })
    test('not packaged (no blockhash), 40 epoch old', async () => {
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_epochNumber: vi.fn(() => Promise.resolve('0x29')), // decimal 41
          cfx_getTransactionByHash: vi.fn(() => Promise.resolve({})),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 2,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce', epochHeight: '0x1'},
          })),
        },
      })

      main(inputs)
      await waitForExpect(() =>
        expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(
          1,
        ),
      )
      await waitForExpect(() =>
        expect(inputs.db.setTxUnsent).toHaveBeenCalledTimes(1),
      )

      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txhash'],
      )

      expect(inputs.rpcs.cfx_epochNumber).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_epochNumber).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['latest_state'],
      )

      expect(inputs.db.setTxUnsent).toHaveBeenLastCalledWith({
        hash: 'txhash',
        resendAt: '0x29',
      })
    })
    test('not packaged (no blockhash), resend at 40 epoch before', async () => {
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_epochNumber: vi.fn(() => Promise.resolve('0x51')), // decimal 81
          cfx_getTransactionByHash: vi.fn(() => Promise.resolve({})),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 2,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {
              nonce: 'txnonce',
              epochHeight: '0x1',
              resendAt: '0x29',
            },
          })),
        },
      })

      main(inputs)
      await waitForExpect(() =>
        expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(
          1,
        ),
      )
      await waitForExpect(() =>
        expect(inputs.db.setTxUnsent).toHaveBeenCalledTimes(1),
      )

      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txhash'],
      )

      expect(inputs.rpcs.cfx_epochNumber).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_epochNumber).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['latest_state'],
      )

      expect(inputs.db.setTxUnsent).toHaveBeenLastCalledWith({
        hash: 'txhash',
        resendAt: '0x51',
      })
    })
    test('packaged, failed, status = 0x1', async () => {
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_getTransactionByHash: vi.fn(() =>
            Promise.resolve({blockHash: 'blockhash', status: '0x1'}),
          ),
          cfx_getTransactionReceipt: vi.fn(() =>
            Promise.resolve({txExecErrorMsg: 'txExecErrorMsg'}),
          ),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 2,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {
              nonce: 'txnonce',
              epochHeight: '0x1',
              resendAt: '0x29',
            },
          })),
        },
      })

      main(inputs)

      await waitForExpect(() =>
        expect(inputs.db.setTxFailed).toHaveBeenCalledTimes(1),
      )

      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txhash'],
      )

      expect(inputs.db.setTxPackaged).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxPackaged).toHaveBeenLastCalledWith({
        hash: 'txhash',
        blockHash: 'blockhash',
      })

      expect(inputs.rpcs.cfx_getTransactionReceipt).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_getTransactionReceipt).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txhash'],
      )

      expect(inputs.db.setTxFailed).toHaveBeenLastCalledWith({
        hash: 'txhash',
        error: 'txExecErrorMsg',
      })
    })
    test('packaged, failed, status = 0x1, cfx_getTransactionReceipt failed', async () => {
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_getTransactionByHash: vi.fn(() =>
            Promise.resolve({blockHash: 'blockhash', status: '0x1'}),
          ),
          cfx_getTransactionReceipt: vi.fn(() => Promise.reject()),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 2,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {
              nonce: 'txnonce',
              epochHeight: '0x1',
              resendAt: '0x29',
            },
          })),
        },
      })

      main(inputs)

      await waitForExpect(() =>
        expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(
          1,
        ),
      )

      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txhash'],
      )

      expect(inputs.db.setTxPackaged).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxPackaged).toHaveBeenLastCalledWith({
        hash: 'txhash',
        blockHash: 'blockhash',
      })

      expect(inputs.rpcs.cfx_getTransactionReceipt).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_getTransactionReceipt).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txhash'],
      )
      expect(inputs.db.setTxPending).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxPending).toHaveBeenLastCalledWith({
        hash: 'txhash',
      })
    })
    test('packaged, skipped, status = 0x2', async () => {
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_getTransactionByHash: vi.fn(() =>
            Promise.resolve({blockHash: 'blockhash', status: '0x2'}),
          ),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 2,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {
              nonce: 'txnonce',
              epochHeight: '0x1',
              resendAt: '0x29',
            },
          })),
        },
      })

      main(inputs)

      await waitForExpect(() =>
        expect(
          inputs.rpcs.wallet_getBlockchainExplorerUrl,
        ).toHaveBeenCalledTimes(1),
      )

      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txhash'],
      )

      expect(inputs.db.setTxPackaged).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxPackaged).toHaveBeenLastCalledWith({
        hash: 'txhash',
        blockHash: 'blockhash',
      })

      expect(inputs.db.setTxSkipped).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxSkipped).toHaveBeenLastCalledWith({
        hash: 'txhash',
        skippedChecked: true,
      })

      expect(
        inputs.rpcs.wallet_getBlockchainExplorerUrl,
      ).toHaveBeenLastCalledWith({transaction: ['txhash']})
    })
    test('packaged, check skipped, status = null', async () => {
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_getTransactionByHash: vi.fn(() =>
            Promise.resolve({blockHash: 'blockhash', status: null}),
          ),
          cfx_getNextNonce: vi.fn(() => Promise.resolve('0x2')),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 2,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {
              nonce: '0x1',
              epochHeight: '0x1',
              resendAt: '0x29',
            },
          })),
        },
      })

      main(inputs)

      await waitForExpect(() =>
        expect(inputs.db.setTxSkipped).toHaveBeenCalledTimes(1),
      )

      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txhash'],
      )

      expect(inputs.db.setTxPackaged).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxPackaged).toHaveBeenLastCalledWith({
        hash: 'txhash',
        blockHash: 'blockhash',
      })

      expect(inputs.db.setTxSkipped).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxSkipped).toHaveBeenLastCalledWith({
        hash: 'txhash',
      })
    })
    test('packaged, recheck skipped, status = null', async () => {
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_getTransactionByHash: vi.fn(() =>
            Promise.resolve({blockHash: 'blockhash', status: null}),
          ),
          cfx_getNextNonce: vi.fn(() => Promise.resolve('0x2')),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 2,
            hash: 'txhash',
            skippedChecked: true,
            raw: 'txraw',
            txPayload: {
              nonce: '0x1',
              epochHeight: '0x1',
              resendAt: '0x29',
            },
          })),
        },
      })

      main(inputs)

      await waitForExpect(() =>
        expect(inputs.db.setTxSkipped).toHaveBeenCalledTimes(1),
      )

      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txhash'],
      )

      expect(inputs.db.setTxPackaged).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxPackaged).toHaveBeenLastCalledWith({
        hash: 'txhash',
        blockHash: 'blockhash',
      })

      expect(inputs.db.setTxSkipped).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxSkipped).toHaveBeenLastCalledWith({
        skippedChecked: true,
        hash: 'txhash',
      })
    })
    test('packaged, executed, status = 0x0', async () => {
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_getTransactionByHash: vi.fn(() =>
            Promise.resolve({blockHash: 'blockhash', status: '0x0'}),
          ),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 2,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {
              nonce: 'txnonce',
              epochHeight: '0x1',
              resendAt: '0x29',
            },
          })),
        },
      })

      main(inputs)

      await waitForExpect(() =>
        expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(
          1,
        ),
      )

      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txhash'],
      )

      expect(inputs.db.setTxPackaged).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxPackaged).toHaveBeenLastCalledWith({
        hash: 'txhash',
        blockHash: 'blockhash',
      })
    })
    test('packages, not executed, status = null, nonce passed', async () => {
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_getTransactionByHash: vi.fn(() =>
            Promise.resolve({blockHash: 'blockhash', status: null}),
          ),
          cfx_getNextNonce: vi.fn(() => Promise.resolve('0x1')),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 2,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {
              nonce: 0,
              epochHeight: '0x1',
              resendAt: '0x29',
            },
          })),
        },
      })

      main(inputs)

      await waitForExpect(() =>
        expect(inputs.db.setTxSkipped).toHaveBeenCalledTimes(1),
      )

      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txhash'],
      )

      expect(inputs.db.setTxPackaged).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxPackaged).toHaveBeenLastCalledWith({
        hash: 'txhash',
        blockHash: 'blockhash',
      })

      expect(inputs.db.setTxPending).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxPending).toHaveBeenLastCalledWith({
        hash: 'txhash',
      })

      expect(inputs.rpcs.cfx_getNextNonce).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_getNextNonce).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['addr'],
      )

      expect(inputs.db.setTxSkipped).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxSkipped).toHaveBeenLastCalledWith({
        hash: 'txhash',
      })
    })
    test('packages, not executed, status = null, nonce is right', async () => {
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_getTransactionByHash: vi.fn(() =>
            Promise.resolve({blockHash: 'blockhash', status: null}),
          ),
          cfx_getNextNonce: vi.fn(() => Promise.resolve('0x0')),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 2,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {
              nonce: 0,
              epochHeight: '0x1',
              resendAt: '0x29',
            },
          })),
        },
      })

      main(inputs)

      await waitForExpect(() =>
        expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(
          1,
        ),
      )

      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txhash'],
      )

      expect(inputs.db.setTxPackaged).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxPackaged).toHaveBeenLastCalledWith({
        hash: 'txhash',
        blockHash: 'blockhash',
      })

      expect(inputs.db.setTxPending).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxPending).toHaveBeenLastCalledWith({
        hash: 'txhash',
      })

      expect(inputs.rpcs.cfx_getNextNonce).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_getNextNonce).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['addr'],
      )
    })
    test('packages, not executed, status = null, cfx_getNextNonce failed', async () => {
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_getTransactionByHash: vi.fn(() =>
            Promise.resolve({blockHash: 'blockhash', status: null}),
          ),
          cfx_getNextNonce: vi.fn(() => Promise.reject()),
        },
        db: {
          getTxById: vi.fn(() => ({
            eid: 'txeid',
            status: 2,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {
              nonce: 0,
              epochHeight: '0x1',
              resendAt: '0x29',
            },
          })),
        },
      })

      main(inputs)

      await waitForExpect(() =>
        expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(
          1,
        ),
      )

      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_getTransactionByHash).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['txhash'],
      )

      expect(inputs.db.setTxPackaged).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxPackaged).toHaveBeenLastCalledWith({
        hash: 'txhash',
        blockHash: 'blockhash',
      })

      expect(inputs.db.setTxPending).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxPending).toHaveBeenLastCalledWith({
        hash: 'txhash',
      })

      expect(inputs.rpcs.cfx_getNextNonce).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.cfx_getNextNonce).toHaveBeenLastCalledWith(
        {errorFallThrough: true},
        ['addr'],
      )
    })
  })
})
