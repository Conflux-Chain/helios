import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'
import {createBundlerClient} from '@fluent-wallet/bundler-client'
import {main} from './index.js'

const mocks = vi.hoisted(() => ({
  getUserOperationReceipt: vi.fn(),
}))

vi.mock('@fluent-wallet/bundler-client', () => ({
  createBundlerClient: vi.fn(() => ({
    getUserOperationReceipt: mocks.getUserOperationReceipt,
  })),
}))

const USER_OPERATION_HASH =
  '0x1111111111111111111111111111111111111111111111111111111111111111'
const TRANSACTION_HASH =
  '0x2222222222222222222222222222222222222222222222222222222222222222'

const NETWORK_ID = 1
const NETWORK = {
  eid: NETWORK_ID,
  chainId: '0x47',
  cacheTime: 1000,
}

function createReceipt(success = true) {
  return {
    success,
    receipt: {
      transactionHash: TRANSACTION_HASH,
    },
  }
}

function createMainInput({
  getOneUserOperation = vi.fn(() => ({
    hash: USER_OPERATION_HASH,
    status: 'pending',
  })),
  setUserOperationIncluded = vi.fn(),
} = {}) {
  return {
    db: {
      getOneUserOperation,
      getNetworkById: vi.fn(() => NETWORK),
      setUserOperationIncluded,
    },
    params: {
      hash: USER_OPERATION_HASH,
      networkId: NETWORK_ID,
    },
  }
}

beforeEach(() => {
  mocks.getUserOperationReceipt.mockReset()
  vi.mocked(createBundlerClient).mockClear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
})

describe('wallet_handleUserOperation', () => {
  test.each([
    ['successful execution', true],
    ['reverted execution', false],
  ])('stores and returns %s', async (_name, success) => {
    const receipt = createReceipt(success)
    const setUserOperationIncluded = vi.fn()

    mocks.getUserOperationReceipt.mockResolvedValue(receipt)

    await expect(
      main(createMainInput({setUserOperationIncluded})),
    ).resolves.toEqual({
      transactionHash: TRANSACTION_HASH,
      success,
    })

    expect(setUserOperationIncluded).toHaveBeenCalledWith({
      hash: USER_OPERATION_HASH,
      transactionHash: TRANSACTION_HASH,
      receipt,
      success,
    })
  })

  test.each([
    ['a missing receipt', null],
    ['a temporary query error', new Error('network unavailable')],
  ])('retries after %s', async (_name, firstResult) => {
    if (firstResult instanceof Error) {
      mocks.getUserOperationReceipt.mockRejectedValueOnce(firstResult)
    } else {
      mocks.getUserOperationReceipt.mockResolvedValueOnce(firstResult)
    }

    mocks.getUserOperationReceipt.mockResolvedValueOnce(createReceipt())

    const resultPromise = main(createMainInput())

    await vi.runAllTimersAsync()

    await expect(resultPromise).resolves.toEqual({
      transactionHash: TRANSACTION_HASH,
      success: true,
    })

    expect(mocks.getUserOperationReceipt).toHaveBeenCalledTimes(2)
  })

  test('shares one tracker between concurrent callers', async () => {
    let resolveReceipt

    mocks.getUserOperationReceipt.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveReceipt = resolve
        }),
    )

    const setUserOperationIncluded = vi.fn()
    const input = createMainInput({setUserOperationIncluded})

    const results = Promise.all([main(input), main(input)])

    resolveReceipt(createReceipt())

    await expect(results).resolves.toEqual([
      {transactionHash: TRANSACTION_HASH, success: true},
      {transactionHash: TRANSACTION_HASH, success: true},
    ])

    expect(mocks.getUserOperationReceipt).toHaveBeenCalledOnce()
    expect(setUserOperationIncluded).toHaveBeenCalledOnce()
  })

  test('returns an included operation without polling', async () => {
    const getOneUserOperation = vi.fn(() => ({
      status: 'included',
      transactionHash: TRANSACTION_HASH,
      success: false,
    }))

    await expect(main(createMainInput({getOneUserOperation}))).resolves.toEqual(
      {
        transactionHash: TRANSACTION_HASH,
        success: false,
      },
    )

    expect(createBundlerClient).not.toHaveBeenCalled()
    expect(mocks.getUserOperationReceipt).not.toHaveBeenCalled()
  })
})
