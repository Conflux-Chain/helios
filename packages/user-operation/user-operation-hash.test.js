import {expect, test} from 'vitest'
import {getUserOperationHash} from './user-operation-hash.js'

test('hashes an EntryPoint v0.8 EIP-7702 UserOperation', () => {
  const hash = getUserOperationHash({
    chainId: 1,
    entryPointAddress: '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108',
    userOperation: {
      sender: '0x1234567890123456789012345678901234567890',
      nonce: 0n,
      factory: '0x7702',
      factoryData: '0xdeadbeef',
      authorization: {
        address: '0x1234567890123456789012345678901234567890',
      },
      callData: '0x',
      verificationGasLimit: 6942069n,
      callGasLimit: 6942069n,
      preVerificationGas: 6942069n,
      maxPriorityFeePerGas: 69n,
      maxFeePerGas: 69420n,
      paymaster: '0x1234567890123456789012345678901234567890',
      paymasterVerificationGasLimit: 6942069n,
      paymasterPostOpGasLimit: 6942069n,
      paymasterData: '0xdeadbeef',
      signature: '0x',
    },
  })

  expect(hash).toBe(
    '0xd96232eb5d02f483166b9b23dca3ec2b963d70f09b961fce348c51d306278462',
  )
})
