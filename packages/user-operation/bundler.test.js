import {expect, test} from 'vitest'
import {
  mergeUserOperationGasEstimate,
  toBundlerUserOperation,
} from './bundler.js'

test('formats an EIP-7702 UserOperation for Bundler RPC', () => {
  expect(
    toBundlerUserOperation({
      sender: '0x1234567890123456789012345678901234567890',
      nonce: 0,
      factory: '0x7702',
      callData: '0xdeadbeef',
      verificationGasLimit: 100,
      callGasLimit: '0xc8',
      preVerificationGas: 300,
      maxPriorityFeePerGas: 1,
      maxFeePerGas: 2,
      signature: '0x1234',
      authorization: {
        address: '0xD165320665C36b2F8F2BB2EfA5621db7eA012028',
        chainId: 71,
        nonce: 0,
        r: '0x01',
        s: '0x02',
        yParity: 0,
      },
    }),
  ).toEqual({
    sender: '0x1234567890123456789012345678901234567890',
    nonce: '0x0',
    factory: '0x7702',
    callData: '0xdeadbeef',
    verificationGasLimit: '0x64',
    callGasLimit: '0xc8',
    preVerificationGas: '0x12c',
    maxPriorityFeePerGas: '0x1',
    maxFeePerGas: '0x2',
    signature: '0x1234',
    eip7702Auth: {
      address: '0xD165320665C36b2F8F2BB2EfA5621db7eA012028',
      chainId: '0x47',
      nonce: '0x0',
      r: `0x${'00'.repeat(31)}01`,
      s: `0x${'00'.repeat(31)}02`,
      yParity: '0x00',
    },
  })
})

test('merges the Bundler gas estimate into a UserOperation', () => {
  const userOperation = {
    sender: '0x1234567890123456789012345678901234567890',
    callGasLimit: '0x0',
    verificationGasLimit: '0x0',
    preVerificationGas: '0x0',
    paymasterVerificationGasLimit: '0x99',
    paymasterPostOpGasLimit: '0x88',
    signature: '0x1234',
  }

  const result = mergeUserOperationGasEstimate(userOperation, {
    callGasLimit: '0x100',
    verificationGasLimit: '0x200',
    preVerificationGas: '0x300',
    paymasterVerificationGasLimit: '0x400',
  })

  expect(result).toEqual({
    ...userOperation,
    callGasLimit: '0x100',
    verificationGasLimit: '0x200',
    preVerificationGas: '0x300',
    paymasterVerificationGasLimit: '0x400',
  })

  expect(result.paymasterPostOpGasLimit).toBe('0x88')
  expect(userOperation.callGasLimit).toBe('0x0')
})
