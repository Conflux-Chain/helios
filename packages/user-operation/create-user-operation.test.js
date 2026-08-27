import {expect, test} from 'vitest'
import {SMART_ACCOUNT_7702_STUB_SIGNATURE} from './account-calls.js'
import {createUserOperationForEstimate} from './create-user-operation.js'

const parameters = {
  sender: '0x1234567890123456789012345678901234567890',
  nonce: 0,
  callData: '0xdeadbeef',
  maxFeePerGas: 100,
  maxPriorityFeePerGas: 1,
  signature: SMART_ACCOUNT_7702_STUB_SIGNATURE,
}

test('creates a UserOperation for gas estimation', () => {
  expect(createUserOperationForEstimate(parameters)).toEqual({
    sender: parameters.sender,
    nonce: '0x0',
    callData: '0xdeadbeef',
    callGasLimit: '0x0',
    verificationGasLimit: '0x0',
    preVerificationGas: '0x0',
    maxFeePerGas: '0x64',
    maxPriorityFeePerGas: '0x1',
    signature: SMART_ACCOUNT_7702_STUB_SIGNATURE,
  })
})

test('adds Paymaster fields when sponsorship is selected', () => {
  expect(
    createUserOperationForEstimate({
      ...parameters,
      paymaster: '0x2dbB152f7D3F673eea1459FE39EcebdF29106652',
    }),
  ).toMatchObject({
    paymaster: '0x2dbB152f7D3F673eea1459FE39EcebdF29106652',
    paymasterVerificationGasLimit: '0x0',
    paymasterPostOpGasLimit: '0x0',
    paymasterData: '0x',
  })
})

test('adds EIP-7702 fields for the first delegation', () => {
  const authorization = {
    address: '0xD165320665C36b2F8F2BB2EfA5621db7eA012028',
    chainId: 71,
    nonce: 1,
    r: `0x${'11'.repeat(32)}`,
    s: `0x${'22'.repeat(32)}`,
    yParity: 0,
  }

  expect(
    createUserOperationForEstimate({...parameters, authorization}),
  ).toMatchObject({
    factory: '0x7702000000000000000000000000000000000000',
    factoryData: '0x',
    authorization,
  })
})
