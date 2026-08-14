import {expect, test, vi} from 'vitest'
import {createBundlerClient} from '@fluent-wallet/bundler-client'
import {EIP7702_NETWORK_CONFIGS} from '@fluent-wallet/consts'
import {main} from './index.js'

const bundler = vi.hoisted(() => ({
  getUserOperationGasPrice: vi.fn(),
  estimateUserOperationGas: vi.fn(),
}))

vi.mock('@fluent-wallet/bundler-client', () => ({
  createBundlerClient: vi.fn(() => bundler),
}))

const NETWORK = {
  name: 'Conflux eSpace Testnet',
  chainId: '0x47',
}

test('prepares a UserOperation using the standard gas price', async () => {
  bundler.getUserOperationGasPrice.mockResolvedValue({
    slow: {
      maxFeePerGas: '0x1',
      maxPriorityFeePerGas: '0x1',
    },
    standard: {
      maxFeePerGas: '0x5efeb1f00',
      maxPriorityFeePerGas: '0x59682f00',
    },
    fast: {
      maxFeePerGas: '0xff',
      maxPriorityFeePerGas: '0xff',
    },
  })

  bundler.estimateUserOperationGas.mockResolvedValue({
    preVerificationGas: '0xbfd5',
    verificationGasLimit: '0x1320b',
    callGasLimit: '0x3fc3',
  })

  const result = await main({
    Err: {
      InvalidParams: message => new Error(message),
    },
    network: NETWORK,
    params: {
      sender: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      nonce: '0x0',
      calls: [
        {
          to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          value: '0x0',
          data: '0x1234',
        },
      ],
    },
  })

  const networkConfig = EIP7702_NETWORK_CONFIGS[NETWORK.chainId]

  expect(createBundlerClient).toHaveBeenCalledWith({
    endpoint: networkConfig.bundlerEndpoint,
  })

  expect(bundler.estimateUserOperationGas).toHaveBeenCalledWith(
    expect.any(Object),
    networkConfig.entryPointAddress,
  )

  expect(result).toMatchObject({
    userOperation: {
      maxFeePerGas: '0x5efeb1f00',
      maxPriorityFeePerGas: '0x59682f00',
      preVerificationGas: '0xbfd5',
      verificationGasLimit: '0x1320b',
      callGasLimit: '0x3fc3',
    },
    maxGasCost: '0xd068a01a3bd00',
  })
})
