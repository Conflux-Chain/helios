import {beforeEach, describe, expect, test, vi} from 'vitest'
import {
  BackendServiceError,
  createBackendClient,
} from '@fluent-wallet/backend-client'
import {EIP7702_NETWORK_CONFIGS} from '@fluent-wallet/consts'
import {EIP7702_AUTHORIZATION_STUB_SIGNATURE} from '@fluent-wallet/user-operation'
import {main} from './index.js'

const backend = vi.hoisted(() => ({
  getPaymasterStub: vi.fn(),
  signPaymasterUserOperation: vi.fn(),
}))

vi.mock('@fluent-wallet/backend-client', async importOriginal => ({
  ...(await importOriginal()),
  createBackendClient: vi.fn(() => backend),
}))

const ACCOUNT_ID = 1
const NETWORK_ID = 2
const SENDER = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const TARGET = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const PREFERRED_DELEGATE = '0x1111111111111111111111111111111111111111'
const CURRENT_DELEGATE = '0x2222222222222222222222222222222222222222'
const PAYMASTER = '0xc7Ef0FDb0c52b1a9E73B2BDa7793611D73f0163e'
const STUB_PAYMASTER_DATA = `0x${'00'.repeat(97)}`
const SIGNED_PAYMASTER_DATA = `0x${'11'.repeat(97)}`

const NETWORK = {
  eid: NETWORK_ID,
  name: 'Conflux eSpace Testnet',
  type: 'eth',
  chainId: '0x47',
}

const CALLS = [
  {
    to: TARGET,
    value: '0x0',
    data: '0x1234',
  },
]

function createMainInput(accountState = 'notDelegated') {
  const db = {
    findAccount: vi.fn(() => ({
      eid: ACCOUNT_ID,
      accountGroup: {vault: {type: 'hd'}},
    })),
    getNetworkById: vi.fn(() => NETWORK),
  }

  const rpcs = {
    eth_getTransactionCount: vi.fn().mockResolvedValue('0x0'),
    wallet_getEip7702AccountStates: vi.fn().mockResolvedValue([
      {
        state: accountState,
        accountAddress: SENDER,
        delegatedAddress:
          accountState === 'delegatedToConfigured' ? CURRENT_DELEGATE : null,
        preferredDelegateAddress: PREFERRED_DELEGATE,
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
    wallet_prepareUserOperation: vi.fn(async (_options, params) => ({
      userOperation: {
        sender: params.sender,
        nonce: params.nonce,
        factory: '0x7702000000000000000000000000000000000000',
        factoryData: '0x',
        callData: '0x1234',
        verificationGasLimit: '0x1',
        callGasLimit: '0x2',
        preVerificationGas: '0x3',
        maxFeePerGas: '0x4',
        maxPriorityFeePerGas: '0x5',
        signature: '0xffff',
        paymaster: params.paymaster,
        paymasterVerificationGasLimit: '0x6',
        paymasterPostOpGasLimit: '0x7',
        paymasterData: params.paymasterData,
        ...(params.authorization
          ? {
              authorization: {
                ...params.authorization,
                ...EIP7702_AUTHORIZATION_STUB_SIGNATURE,
              },
            }
          : {}),
      },
      maxGasCost: '0x123',
    })),
  }

  return {
    input: {
      Err: {InvalidParams: message => new Error(message)},
      db,
      rpcs,
      params: {
        accountId: ACCOUNT_ID,
        networkId: NETWORK_ID,
        calls: CALLS,
      },
    },
    rpcs,
  }
}

beforeEach(() => {
  backend.getPaymasterStub.mockReset().mockResolvedValue({
    address: PAYMASTER,
    data: STUB_PAYMASTER_DATA,
  })
  backend.signPaymasterUserOperation
    .mockReset()
    .mockResolvedValue(SIGNED_PAYMASTER_DATA)
  vi.mocked(createBackendClient).mockClear()
})

describe('wallet_prepareSponsorship', () => {
  test('prepares and signs one sponsorship for an account upgrade', async () => {
    const {input, rpcs} = createMainInput()
    const result = await main(input)
    const {backendBaseUrl} = EIP7702_NETWORK_CONFIGS[NETWORK.chainId]

    expect(createBackendClient).toHaveBeenCalledWith({baseUrl: backendBaseUrl})
    expect(backend.getPaymasterStub).toHaveBeenCalledWith({
      sender: SENDER.toLowerCase(),
      delegation: PREFERRED_DELEGATE,
    })
    expect(rpcs.wallet_prepareUserOperation).toHaveBeenCalledWith(
      {errorFallThrough: true, network: NETWORK},
      {
        sender: SENDER.toLowerCase(),
        nonce: '0x0',
        calls: CALLS,
        paymaster: PAYMASTER,
        paymasterData: STUB_PAYMASTER_DATA,
        authorization: {
          chainId: NETWORK.chainId,
          address: PREFERRED_DELEGATE,
          nonce: '0x0',
        },
      },
    )
    expect(backend.signPaymasterUserOperation).toHaveBeenCalledOnce()

    const signRequest = backend.signPaymasterUserOperation.mock.calls[0][0]
    expect(signRequest).not.toHaveProperty('authorization')
    expect(signRequest).toMatchObject({
      sender: SENDER.toLowerCase(),
      nonce: '0x0',
      paymaster: PAYMASTER,
      paymasterData: STUB_PAYMASTER_DATA,
    })
    expect(signRequest).not.toHaveProperty('delegatedContract')
    expect(backend.getPaymasterStub.mock.invocationCallOrder[0]).toBeLessThan(
      rpcs.wallet_prepareUserOperation.mock.invocationCallOrder[0],
    )
    expect(
      rpcs.wallet_prepareUserOperation.mock.invocationCallOrder[0],
    ).toBeLessThan(
      backend.signPaymasterUserOperation.mock.invocationCallOrder[0],
    )
    expect(result).toMatchObject({
      supported: true,
      available: true,
      reason: null,
      maxGasCost: '0x123',
      requiredDelegationAction: 'upgrade',
      sponsorship: {
        userOperation: {
          paymaster: PAYMASTER,
          paymasterData: SIGNED_PAYMASTER_DATA,
        },
      },
    })
  })

  test('maps a Paymaster business rejection to an unavailable result', async () => {
    const {input} = createMainInput('delegatedToConfigured')
    backend.signPaymasterUserOperation.mockRejectedValue(
      new BackendServiceError({
        code: 4003,
        message: 'Contract is not in whitelist',
      }),
    )

    await expect(main(input)).resolves.toEqual({
      supported: true,
      available: false,
      reason: 'contractNotWhitelisted',
      maxGasCost: null,
      requiredDelegationAction: null,
      sponsorship: null,
    })
    expect(backend.signPaymasterUserOperation).toHaveBeenCalledOnce()
  })
})
