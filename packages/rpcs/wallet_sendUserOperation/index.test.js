import {beforeEach, describe, expect, test, vi} from 'vitest'
import {
  BundlerRpcError,
  createBundlerClient,
} from '@fluent-wallet/bundler-client'
import {
  EIP7702_NETWORK_CONFIGS,
  USER_OPERATION_ERROR_CODES,
} from '@fluent-wallet/consts'
import {
  EIP7702_AUTHORIZATION_STUB_SIGNATURE,
  SMART_ACCOUNT_7702_STUB_SIGNATURE,
  createUserOperationForEstimate,
  encodeAccountCalls,
  getUserOperationHash,
  mergeUserOperationGasEstimate,
} from '@fluent-wallet/user-operation'
import {main} from './index.js'

const bundler = vi.hoisted(() => ({
  sendUserOperation: vi.fn(),
}))

vi.mock('@fluent-wallet/bundler-client', async importOriginal => ({
  ...(await importOriginal()),
  createBundlerClient: vi.fn(() => bundler),
}))

const ACCOUNT_ID = 1
const NETWORK_ID = 2
const ADDRESS_ID = 3
const APP_ID = 4

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

const DELEGATE_ADDRESS =
  EIP7702_NETWORK_CONFIGS[NETWORK.chainId].delegateAddress
const PAYMASTER_ADDRESS = '0xc7Ef0FDb0c52b1a9E73B2BDa7793611D73f0163e'

function createPaymasterData(validUntil) {
  // validAfter(6) || validUntil(6) || signature(65)
  return `0x${'0'.repeat(12)}${validUntil.padStart(12, '0')}${'0'.repeat(130)}`
}

const VALID_PAYMASTER_DATA = createPaymasterData('ffffffffffff')
const EXPIRED_PAYMASTER_DATA = createPaymasterData('0')

const CALLS = [
  {
    to: TARGET,
    value: '0x0',
    data: '0x1234',
  },
]

function prepareUserOperation({
  sender,
  nonce,
  calls,
  authorization,
  paymaster,
  paymasterData,
}) {
  const userOperation = createUserOperationForEstimate({
    sender,
    nonce,
    callData: encodeAccountCalls(calls),
    maxFeePerGas: '0x5efeb1f00',
    maxPriorityFeePerGas: '0x59682f00',
    signature: SMART_ACCOUNT_7702_STUB_SIGNATURE,
    paymaster,
    paymasterData,
    authorization: authorization
      ? {...authorization, ...EIP7702_AUTHORIZATION_STUB_SIGNATURE}
      : undefined,
  })

  return mergeUserOperationGasEstimate(userOperation, {
    preVerificationGas: '0xbfd5',
    verificationGasLimit: '0x1320b',
    callGasLimit: '0x3fc3',
    ...(paymaster
      ? {
          paymasterVerificationGasLimit: '0x52e3',
          paymasterPostOpGasLimit: '0x141f',
        }
      : {}),
  })
}

function createMainInput() {
  const db = {
    findAccount: vi.fn(() => ({
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
    insertUserOperation: vi.fn(),
    setUserOperationFailed: vi.fn(),
  }

  const rpcs = {
    eth_getTransactionCount: vi.fn().mockResolvedValue('0x0'),
    wallet_getAddressPrivateKey: vi.fn().mockResolvedValue(PRIVATE_KEY),
    wallet_getEip7702AccountStates: vi.fn().mockResolvedValue([
      {
        state: 'delegatedToConfigured',
      },
    ]),
    wallet_getEthereumNonceState: vi.fn().mockResolvedValue({
      networkPendingNonce: '0x0',
      occupiedNonces: [],
    }),
    wallet_getUserOperationNonceState: vi.fn().mockResolvedValue({
      networkPendingNonce: '0x0',
      occupiedNonces: [],
    }),
    wallet_handleUserOperation: vi.fn().mockResolvedValue(),
    wallet_prepareUserOperation: vi.fn(async (_options, params) => ({
      userOperation: prepareUserOperation(params),
      maxGasCost: '0x0',
    })),
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
})

describe('wallet_sendUserOperation', () => {
  test.each([
    ['upgrade', 'notDelegated'],
    ['switch', 'delegatedToOther'],
  ])(
    'submits a signed EIP-7702 authorization after confirmed %s',
    async (approvedDelegationAction, accountState) => {
      const {input, db, rpcs} = createMainInput()
      input.params.approvedDelegationAction = approvedDelegationAction

      rpcs.wallet_getEip7702AccountStates.mockResolvedValue([
        {
          state: accountState,
        },
      ])

      bundler.sendUserOperation.mockImplementation(
        async (userOperation, entryPointAddress) =>
          getUserOperationHash({
            chainId: NETWORK.chainId,
            entryPointAddress,
            userOperation,
          }),
      )

      const result = await main(input)

      const [, prepareParams] = rpcs.wallet_prepareUserOperation.mock.calls[0]
      const preparedUserOperation = prepareUserOperation(prepareParams)
      const [submittedUserOperation] = bundler.sendUserOperation.mock.calls[0]
      const storedUserOperation = getStoredUserOperation(db)

      expect(preparedUserOperation).toMatchObject({
        factory: '0x7702000000000000000000000000000000000000',
        factoryData: '0x',
        authorization: {
          chainId: NETWORK.chainId,
          address: DELEGATE_ADDRESS,
          nonce: '0x0',
          ...EIP7702_AUTHORIZATION_STUB_SIGNATURE,
        },
      })

      expect(submittedUserOperation.authorization).toMatchObject({
        chainId: NETWORK.chainId,
        address: DELEGATE_ADDRESS,
        nonce: '0x0',
        r: expect.stringMatching(/^0x[0-9a-f]{64}$/),
        s: expect.stringMatching(/^0x[0-9a-f]{64}$/),
        yParity: expect.stringMatching(/^0x[01]$/),
      })
      expect(submittedUserOperation.authorization).not.toEqual(
        preparedUserOperation.authorization,
      )

      expect(storedUserOperation).toMatchObject({
        hash: result.userOpHash,
        authorizationNonce: '0x0',
        delegateAddress: DELEGATE_ADDRESS,
      })

      expect(storedUserOperation).not.toHaveProperty('authorization')
      expect(storedUserOperation.paymaster).toBeUndefined()
      expect(rpcs.wallet_getEip7702AccountStates).toHaveBeenCalledTimes(2)
      expect(rpcs.wallet_getAddressPrivateKey).toHaveBeenCalledOnce()
      expect(
        rpcs.wallet_prepareUserOperation.mock.invocationCallOrder[0],
      ).toBeLessThan(
        rpcs.wallet_getAddressPrivateKey.mock.invocationCallOrder[0],
      )
      expect(rpcs.eth_getTransactionCount).toHaveBeenCalledWith(
        {
          errorFallThrough: true,
          networkName: NETWORK.name,
          _cacheConf: {type: null},
        },
        [SENDER.toLowerCase(), 'latest'],
      )
    },
  )

  test('stops before signing when delegation was not confirmed', async () => {
    const {input, db, rpcs} = createMainInput()

    rpcs.wallet_getEip7702AccountStates.mockResolvedValue([
      {
        state: 'notDelegated',
      },
    ])

    await expect(main(input)).rejects.toThrow(
      'EIP-7702 upgrade was not confirmed by the user',
    )

    expect(rpcs.wallet_prepareUserOperation).not.toHaveBeenCalled()
    expect(rpcs.wallet_getAddressPrivateKey).not.toHaveBeenCalled()
    expect(db.insertUserOperation).not.toHaveBeenCalled()
    expect(bundler.sendUserOperation).not.toHaveBeenCalled()
  })

  test('stores pending, submits, and starts receipt tracking', async () => {
    const {input, db, rpcs} = createMainInput()
    input.params.appId = APP_ID
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
      appId: APP_ID,
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

  test('reuses the sponsored UserOperation without preparing it again', async () => {
    const {input, db, rpcs} = createMainInput()
    input.params.sponsorship = {
      userOperation: prepareUserOperation({
        sender: SENDER,
        nonce: '0x0',
        calls: CALLS,
        paymaster: PAYMASTER_ADDRESS,
        paymasterData: VALID_PAYMASTER_DATA,
      }),
    }

    bundler.sendUserOperation.mockImplementation(
      async (userOperation, entryPointAddress) =>
        getUserOperationHash({
          chainId: NETWORK.chainId,
          entryPointAddress,
          userOperation,
        }),
    )

    await main(input)

    expect(rpcs.wallet_prepareUserOperation).not.toHaveBeenCalled()
    expect(bundler.sendUserOperation.mock.calls[0][0]).toMatchObject({
      paymaster: PAYMASTER_ADDRESS,
      paymasterData: VALID_PAYMASTER_DATA,
    })
    expect(getStoredUserOperation(db)).toMatchObject({
      paymaster: PAYMASTER_ADDRESS,
    })
  })

  test('stops before signing when sponsorship is expired', async () => {
    const {input, db, rpcs} = createMainInput()
    input.params.sponsorship = {
      userOperation: prepareUserOperation({
        sender: SENDER,
        nonce: '0x0',
        calls: CALLS,
        paymaster: PAYMASTER_ADDRESS,
        paymasterData: EXPIRED_PAYMASTER_DATA,
      }),
    }

    await expect(main(input)).rejects.toMatchObject({
      extra: {
        code: USER_OPERATION_ERROR_CODES.SPONSORSHIP_REFRESH_REQUIRED,
      },
    })

    expect(rpcs.wallet_prepareUserOperation).not.toHaveBeenCalled()
    expect(rpcs.wallet_getAddressPrivateKey).not.toHaveBeenCalled()
    expect(db.insertUserOperation).not.toHaveBeenCalled()
    expect(bundler.sendUserOperation).not.toHaveBeenCalled()
  })

  test('marks a definitive Bundler rejection as failed', async () => {
    const {input, db, rpcs} = createMainInput()
    const error = new BundlerRpcError({
      code: -32501,
      message: 'validation failed',
      data: {
        reason: 'account validation denied',
      },
    })

    bundler.sendUserOperation.mockRejectedValue(error)

    await expect(main(input)).rejects.toBe(error)

    const storedUserOperation = getStoredUserOperation(db)

    expect(db.setUserOperationFailed).toHaveBeenCalledWith({
      hash: storedUserOperation.hash,
      error: {
        code: -32501,
        message: 'validation failed',
        data: {
          reason: 'account validation denied',
        },
      },
    })
    expect(rpcs.wallet_handleUserOperation).not.toHaveBeenCalled()
  })

  test('throws and tracks when submission is uncertain', async () => {
    const {input, db, rpcs} = createMainInput()

    bundler.sendUserOperation.mockRejectedValue(
      new Error('network unavailable'),
    )

    await expect(main(input)).rejects.toThrow('network unavailable')

    const storedUserOperation = getStoredUserOperation(db)

    expect(db.setUserOperationFailed).not.toHaveBeenCalled()
    expectUserOperationTracking(rpcs, storedUserOperation.hash)
  })

  test('throws and tracks when the Bundler returns an unexpected hash', async () => {
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
