import {expect, test} from 'vitest'
import {entryPointV08Interface} from '@fluent-wallet/contract-abis/entry-point-v08.js'
import {
  decodeGetNonceResult,
  decodeGetUserOpHashResult,
  encodeGetNonceCall,
  encodeGetUserOpHashCall,
} from './entry-point.js'

const SENDER = '0x1234567890123456789012345678901234567890'

test('encodes and decodes EntryPoint getNonce', () => {
  expect(encodeGetNonceCall(SENDER)).toBe(
    '0x35567e1a' +
      '0000000000000000000000001234567890123456789012345678901234567890' +
      '0000000000000000000000000000000000000000000000000000000000000000',
  )

  const result = entryPointV08Interface.encodeFunctionResult('getNonce', [69])

  expect(decodeGetNonceResult(result)).toBe('0x45')
})

test('encodes and decodes EntryPoint getUserOpHash', () => {
  const callData = encodeGetUserOpHashCall({
    sender: SENDER,
    nonce: '0x0',
    callData: '0xdeadbeef',
    verificationGasLimit: '0x1',
    callGasLimit: '0x1',
    preVerificationGas: '0x1',
    maxPriorityFeePerGas: '0x1',
    maxFeePerGas: '0x1',
    signature: '0x',
  })

  expect(callData.slice(0, 10)).toBe('0x22cdde4c')

  const [packedUserOperation] = entryPointV08Interface.decodeFunctionData(
    'getUserOpHash',
    callData,
  )

  expect(packedUserOperation.sender).toBe(SENDER)
  expect(packedUserOperation.accountGasLimits).toBe(
    '0x0000000000000000000000000000000100000000000000000000000000000001',
  )

  const expectedHash =
    '0x1234567890123456789012345678901234567890123456789012345678901234'
  const result = entryPointV08Interface.encodeFunctionResult('getUserOpHash', [
    expectedHash,
  ])

  expect(decodeGetUserOpHashResult(result)).toBe(expectedHash)
})
