import {beforeEach, describe, expect, test, vi} from 'vitest'
import {
  BundlerRpcError,
  createBundlerClient,
} from '@fluent-wallet/bundler-client'
import {getUserOperationHash} from '@fluent-wallet/user-operation'
import {main} from './index.js'

const bundler = vi.hoisted(() => ({
  getUserOperationGasPrice: vi.fn(),
  estimateUserOperationGas: vi.fn(),
  sendUserOperation: vi.fn(),
}))

vi.mock('@fluent-wallet/bundler-client', async importOriginal => ({
  ...(await importOriginal()),
  createBundlerClient: vi.fn(() => bundler),
}))

const ACCOUNT_ID = 1
const NETWORK_ID = 2
const ADDRESS_ID = 3

const PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const SENDER = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const TARGET = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

const UNEXPECTED_HASH =
  '0x9999999999999999999999999999999999999999999999999999999999999999'

const NETWORK = {
  eid: NETWORK_ID,
  name: 'Conflux eSpace Testnet',
  type: 'eth',
  chainId: '0x47',
  cacheTime: 1000,
}

const CALLS = [
  {
    to: TARGET,
    value: '0x0',
    data: '0x1234',
  },
]

function createMainInput() {
  const db = {
    getAccountById: vi.fn(() => ({
      eid: ACCOUNT_ID,
      accountGroup: {
        vault: {
          type: 'hd',
        },
      },
    })),
    getNetworkById: vi.fn(() => NETWORK),
    accountAddrByNetwork: vi.fn(() => ({
      eid: ADDRESS_ID,
      value: SENDER,
    })),
    getOccupiedUserOperationNonces: vi.fn(() => []),
    insertUserOperation: vi.fn(),
    setUserOperationFailed: vi.fn(),
  }

  const rpcs = {
    eth_call: vi.fn().mockResolvedValue(`0x${'0'.repeat(64)}`),
    wallet_getAddressPrivateKey: vi.fn().mockResolvedValue(PRIVATE_KEY),
    wallet_getEip7702AccountStates: vi.fn().mockResolvedValue([
      {
        state: 'delegatedToConfigured',
      },
    ]),
    wallet_handleUserOperation: vi.fn().mockResolvedValue(),
  }

  return {
    input: {
      Err: {
        InvalidParams: message => new Error(message),
        Server: message => new Error(message),
      },
      db,
      rpcs,
      params: {
        accountId: ACCOUNT_ID,
        networkId: NETWORK_ID,
        calls: CALLS,
      },
      network: NETWORK,
    },
    db,
    rpcs,
  }
}

function getStoredUserOperation(db) {
  return db.insertUserOperation.mock.calls[0][0]
}

function expectUserOperationTracking(rpcs, hash) {
  expect(rpcs.wallet_handleUserOperation).toHaveBeenCalledOnce()
  expect(rpcs.wallet_handleUserOperation).toHaveBeenCalledWith(
    {errorFallThrough: true},
    {
      hash,
      networkId: NETWORK_ID,
    },
  )
}

beforeEach(() => {
  for (const mock of Object.values(bundler)) {
    mock.mockReset()
  }

  vi.mocked(createBundlerClient).mockClear()

  bundler.getUserOperationGasPrice.mockResolvedValue({
    standard: {
      maxFeePerGas: '0x5efeb1f00',
      maxPriorityFeePerGas: '0x59682f00',
    },
  })

  bundler.estimateUserOperationGas.mockResolvedValue({
    preVerificationGas: '0xbfd5',
    verificationGasLimit: '0x1320b',
    callGasLimit: '0x3fc3',
    paymasterVerificationGasLimit: '0x52e3',
    paymasterPostOpGasLimit: '0x141f',
  })
})

describe('wallet_sendUserOperation', () => {
  test('stores pending, submits, and starts receipt tracking', async () => {
    const {input, db, rpcs} = createMainInput()

    bundler.sendUserOperation.mockImplementation(
      async (userOperation, entryPointAddress) =>
        getUserOperationHash({
          chainId: NETWORK.chainId,
          entryPointAddress,
          userOperation,
        }),
    )

    const result = await main(input)
    const storedUserOperation = getStoredUserOperation(db)

    expect(result).toEqual({
      userOpHash: storedUserOperation.hash,
    })
    expect(storedUserOperation).toMatchObject({
      addressId: ADDRESS_ID,
      hash: result.userOpHash,
      sender: SENDER.toLowerCase(),
      chainId: NETWORK.chainId,
      nonce: '0x0',
      calls: CALLS,
    })

    expect(db.setUserOperationFailed).not.toHaveBeenCalled()
    expectUserOperationTracking(rpcs, result.userOpHash)

    expect(db.insertUserOperation.mock.invocationCallOrder[0]).toBeLessThan(
      bundler.sendUserOperation.mock.invocationCallOrder[0],
    )
    expect(bundler.sendUserOperation.mock.invocationCallOrder[0]).toBeLessThan(
      rpcs.wallet_handleUserOperation.mock.invocationCallOrder[0],
    )
  })

  test('marks a definitive Bundler rejection as failed', async () => {
    const {input, db, rpcs} = createMainInput()
    const error = new BundlerRpcError({
      code: -32501,
      message: 'paymaster validation failed',
      data: {
        reason: 'sponsorship denied',
      },
    })

    bundler.sendUserOperation.mockRejectedValue(error)

    await expect(main(input)).rejects.toBe(error)

    const storedUserOperation = getStoredUserOperation(db)

    expect(db.setUserOperationFailed).toHaveBeenCalledWith({
      hash: storedUserOperation.hash,
      error: {
        code: -32501,
        message: 'paymaster validation failed',
        data: {
          reason: 'sponsorship denied',
        },
      },
    })
    expect(rpcs.wallet_handleUserOperation).not.toHaveBeenCalled()
  })

  test('tracks an operation when the submission outcome is unknown', async () => {
    const {input, db, rpcs} = createMainInput()
    const error = new Error('network unavailable')

    bundler.sendUserOperation.mockRejectedValue(error)

    await expect(main(input)).rejects.toBe(error)

    const storedUserOperation = getStoredUserOperation(db)

    expect(db.setUserOperationFailed).not.toHaveBeenCalled()
    expectUserOperationTracking(rpcs, storedUserOperation.hash)
  })

  test('rejects an unexpected Bundler hash and tracks the local hash', async () => {
    const {input, db, rpcs} = createMainInput()

    bundler.sendUserOperation.mockResolvedValue(UNEXPECTED_HASH)

    await expect(main(input)).rejects.toThrow(
      'Bundler returned an unexpected UserOperation hash',
    )

    const storedUserOperation = getStoredUserOperation(db)

    expect(storedUserOperation.hash).not.toBe(UNEXPECTED_HASH)
    expect(db.setUserOperationFailed).not.toHaveBeenCalled()
    expectUserOperationTracking(rpcs, storedUserOperation.hash)
  })
})
