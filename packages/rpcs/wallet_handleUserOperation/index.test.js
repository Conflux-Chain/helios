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
  ])('stores an included receipt for %s', async (_name, success) => {
    const receipt = createReceipt(success)

    mocks.getUserOperationReceipt.mockResolvedValue(receipt)

    const setUserOperationIncluded = vi.fn()

    await main(
      createMainInput({
        setUserOperationIncluded,
      }),
    )

    expect(mocks.getUserOperationReceipt).toHaveBeenCalledOnce()
    expect(mocks.getUserOperationReceipt).toHaveBeenCalledWith(
      USER_OPERATION_HASH,
    )
    expect(setUserOperationIncluded).toHaveBeenCalledWith({
      hash: USER_OPERATION_HASH,
      transactionHash: TRANSACTION_HASH,
      receipt,
      success,
    })
    expect(vi.getTimerCount()).toBe(0)
  })

  test.each([
    ['receipt is not available', null],
    ['receipt query temporarily fails', new Error('network unavailable')],
  ])('schedules another poll when %s', async (_name, result) => {
    if (result instanceof Error) {
      mocks.getUserOperationReceipt.mockRejectedValueOnce(result)
    } else {
      mocks.getUserOperationReceipt.mockResolvedValueOnce(result)
    }
    const receipt = createReceipt()
    mocks.getUserOperationReceipt.mockResolvedValueOnce(receipt)

    const setUserOperationIncluded = vi.fn()

    await main(
      createMainInput({
        setUserOperationIncluded,
      }),
    )

    expect(setUserOperationIncluded).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(1)

    await vi.runOnlyPendingTimersAsync()

    expect(mocks.getUserOperationReceipt).toHaveBeenCalledTimes(2)
    expect(setUserOperationIncluded).toHaveBeenCalledWith({
      hash: USER_OPERATION_HASH,
      transactionHash: TRANSACTION_HASH,
      receipt,
      success: true,
    })
    expect(vi.getTimerCount()).toBe(0)
  })

  test('does not start a second tracker for the same operation', async () => {
    const receipt = createReceipt()
    let resolveReceipt
    mocks.getUserOperationReceipt.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveReceipt = resolve
        }),
    )

    const setUserOperationIncluded = vi.fn()
    const input = createMainInput({setUserOperationIncluded})
    const firstTracker = main(input)

    await main(input)

    expect(mocks.getUserOperationReceipt).toHaveBeenCalledOnce()

    resolveReceipt(receipt)
    await firstTracker

    expect(setUserOperationIncluded).toHaveBeenCalledOnce()
  })

  test.each([
    ['missing operation', undefined],
    ['included operation', {status: 'included'}],
    ['failed operation', {status: 'failed'}],
  ])('stops handling a %s', async (_name, userOperation) => {
    const setUserOperationIncluded = vi.fn()

    await main(
      createMainInput({
        getOneUserOperation: vi.fn(() => userOperation),
        setUserOperationIncluded,
      }),
    )

    expect(createBundlerClient).not.toHaveBeenCalled()
    expect(mocks.getUserOperationReceipt).not.toHaveBeenCalled()
    expect(setUserOperationIncluded).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })
})
