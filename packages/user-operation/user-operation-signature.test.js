import {arrayify, joinSignature} from '@ethersproject/bytes'
import {hashMessage} from '@ethersproject/hash'
import {SigningKey} from '@ethersproject/signing-key'
import {recoverAddress} from '@ethersproject/transactions'
import {expect, test} from 'vitest'
import {getUserOperationHash} from './user-operation-hash.js'

const PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const SENDER = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const ENTRY_POINT = '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108'
const DELEGATE = '0xD165320665C36b2F8F2BB2EfA5621db7eA012028'

const userOperation = {
  sender: SENDER,
  nonce: '0x0',
  callData: '0xdeadbeef',
  verificationGasLimit: '0x10000',
  callGasLimit: '0x10000',
  preVerificationGas: '0x10000',
  maxPriorityFeePerGas: '0x1',
  maxFeePerGas: '0x2',
  paymaster: '0x2dbB152f7D3F673eea1459FE39EcebdF29106652',
  paymasterVerificationGasLimit: '0x10000',
  paymasterPostOpGasLimit: '0x10000',
  paymasterData: '0x',
  signature: '0x',
}

function signDigest(digest) {
  return joinSignature(new SigningKey(PRIVATE_KEY).signDigest(digest))
}

test.each([
  ['an already delegated account', userOperation],
  [
    'the first EIP-7702 delegation',
    {
      ...userOperation,
      factory: '0x7702',
      factoryData: '0x',
      authorization: {address: DELEGATE},
    },
  ],
])('signs the raw UserOperation hash for %s', (_, operation) => {
  const userOperationHash = getUserOperationHash({
    chainId: 71,
    entryPointAddress: ENTRY_POINT,
    userOperation: operation,
  })

  expect(recoverAddress(userOperationHash, signDigest(userOperationHash))).toBe(
    SENDER,
  )
})

test('does not use a personal-sign prefix', () => {
  const userOperationHash = getUserOperationHash({
    chainId: 71,
    entryPointAddress: ENTRY_POINT,
    userOperation,
  })
  const personalSignature = signDigest(hashMessage(arrayify(userOperationHash)))

  expect(recoverAddress(userOperationHash, personalSignature)).not.toBe(SENDER)
})
