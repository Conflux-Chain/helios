// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import waitForExpect from 'wait-for-expect'
import {mergeDeepObj} from '@thi.ng/associative'
import {main} from './index.js'

let defaultInputs

beforeEach(() => {
  defaultInputs = {
    rpcs: {
      cfx_epochNumber: jest.fn(() => Promise.resolve()),
      cfx_sendRawTransaction: jest.fn(() => Promise.resolve()),
      cfx_getTransactionByHash: jest.fn(() => Promise.resolve()),
      cfx_getTransactionReceipt: jest.fn(() => Promise.resolve()),
      cfx_getNextNonce: jest.fn(() => Promise.resolve()),
      wallet_getBlockchainExplorerUrl: jest.fn(() => Promise.resolve()),
      wallet_handleUnfinishedCFXTx: jest.fn(() => Promise.resolve()),
    },
    db: {
      retractAttr: jest.fn(),
      getUnfinishedTxCount: jest.fn(() => 0),
      getAddressById: jest.fn(() => ({
        eid: 'addreid',
        value: 'addr',
        hex: 'addr',
      })),
      getTxById: jest.fn(() => ({
        eid: 'txeid',
        status: 0,
        hash: 'txhash',
        raw: 'txraw',
        txPayload: {nonce: 'txnonce'},
      })),
      setTxSkipped: jest.fn(),
      setTxFailed: jest.fn(),
      setTxSending: jest.fn(),
      setTxPending: jest.fn(),
      setTxPackaged: jest.fn(),
      setTxExecuted: jest.fn(),
      setTxConfirmed: jest.fn(),
      setTxUnsent: jest.fn(),
      setTxChainSwitched: jest.fn(),
    },
    params: {
      tx: 'txid',
      address: 'addr',
      okCb: jest.fn(),
      failedCb: jest.fn(),
    },
    network: {cacheTime: 0},
  }
})

describe('wallet_handleUnfinishedCFXTx', function () {
  describe('unsent', function () {
    test('success', async () => {
      const inputs = mergeDeepObj(defaultInputs, {
        db: {
          getTxById: jest.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
          })),
        },
      })

      await main(inputs)
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
          cfx_sendRawTransaction: jest.fn(() =>
            Promise.reject({data: 'tx already exist'}),
          ),
        },
        db: {
          getTxById: jest.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
          })),
        },
      })

      await main(inputs)
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
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_sendRawTransaction: jest.fn(() =>
            Promise.reject({data: 'tx pool is full'}),
          ),
        },
        db: {
          getTxById: jest.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
          })),
        },
      })

      await main(inputs)
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

      expect(inputs.params.okCb).toHaveBeenCalledTimes(0)

      expect(inputs.db.setTxUnsent).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxUnsent).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenLastCalledWith(
        {
          tx: 'txeid',
          address: 'addreid',
        },
      )
    })
    test('Error in sendRawTx Transaction Pool is full', async () => {
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_sendRawTransaction: jest.fn(() =>
            Promise.reject({data: 'Transaction Pool is full'}),
          ),
        },
        db: {
          getTxById: jest.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
          })),
        },
      })

      await main(inputs)
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

      expect(inputs.params.okCb).toHaveBeenCalledTimes(0)

      expect(inputs.db.setTxUnsent).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxUnsent).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenLastCalledWith(
        {
          tx: 'txeid',
          address: 'addreid',
        },
      )
    })
    test('Error in sendRawTx still in the catch up mode', async () => {
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_sendRawTransaction: jest.fn(() =>
            Promise.reject({data: 'still in the catch up mode'}),
          ),
        },
        db: {
          getTxById: jest.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
          })),
        },
      })

      await main(inputs)
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

      expect(inputs.params.okCb).toHaveBeenCalledTimes(0)

      expect(inputs.db.setTxUnsent).toHaveBeenCalledTimes(1)
      expect(inputs.db.setTxUnsent).toHaveBeenLastCalledWith({hash: 'txhash'})

      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenCalledTimes(1)
      expect(inputs.rpcs.wallet_handleUnfinishedCFXTx).toHaveBeenLastCalledWith(
        {
          tx: 'txeid',
          address: 'addreid',
        },
      )
    })
    test('Error in sendRawTx Can not recover pubkey', async () => {
      const err = {data: 'Can not recover pubkey'}
      const inputs = mergeDeepObj(defaultInputs, {
        rpcs: {
          cfx_sendRawTransaction: jest.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: jest.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      await main(inputs)
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
          cfx_sendRawTransaction: jest.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: jest.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      await main(inputs)
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
          cfx_sendRawTransaction: jest.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: jest.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      await main(inputs)
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
          cfx_sendRawTransaction: jest.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: jest.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      await main(inputs)
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
          cfx_sendRawTransaction: jest.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: jest.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      await main(inputs)
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
          cfx_sendRawTransaction: jest.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: jest.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      await main(inputs)
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
          cfx_sendRawTransaction: jest.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: jest.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      await main(inputs)
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
          cfx_sendRawTransaction: jest.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: jest.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      await main(inputs)
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
          cfx_sendRawTransaction: jest.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: jest.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      await main(inputs)
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
          cfx_sendRawTransaction: jest.fn(() => Promise.reject(err)),
        },
        db: {
          getTxById: jest.fn(() => ({
            eid: 'txeid',
            status: 0,
            hash: 'txhash',
            raw: 'txraw',
            txPayload: {nonce: 'txnonce'},
          })),
        },
      })

      await main(inputs)
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
})
