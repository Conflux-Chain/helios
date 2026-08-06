import {expect, test} from 'vitest'
import {toPackedUserOperation} from './packing.js'

const userOperation = {
  sender: '0x1234567890123456789012345678901234567890',
  nonce: '0x0',
  factory: '0x7702',
  factoryData: '0xdeadbeef',
  authorization: {
    address: '0x1234567890123456789012345678901234567890',
  },
  callData: '0xdeadbeef',
  verificationGasLimit: '0x69ed75',
  callGasLimit: '0x69ed75',
  preVerificationGas: '0x69ed75',
  maxPriorityFeePerGas: '0x45',
  maxFeePerGas: '0x10f2c',
  paymaster: '0x1234567890123456789012345678901234567890',
  paymasterVerificationGasLimit: '0x69ed75',
  paymasterPostOpGasLimit: '0x69ed75',
  paymasterData: '0xdeadbeef',
  signature: '0x',
}

test('packs an EntryPoint v0.8 EIP-7702 UserOperation', () => {
  expect(toPackedUserOperation(userOperation)).toEqual({
    sender: '0x1234567890123456789012345678901234567890',
    nonce: '0x0',
    initCode: '0x7702deadbeef',
    callData: '0xdeadbeef',
    accountGasLimits:
      '0x0000000000000000000000000069ed750000000000000000000000000069ed75',
    preVerificationGas: '0x69ed75',
    gasFees:
      '0x0000000000000000000000000000004500000000000000000000000000010f2c',
    paymasterAndData:
      '0x12345678901234567890123456789012345678900000000000000000000000000069ed750000000000000000000000000069ed75deadbeef',
    signature: '0x',
  })

  expect(toPackedUserOperation(userOperation, {forHash: true}).initCode).toBe(
    '0x1234567890123456789012345678901234567890deadbeef',
  )
})
