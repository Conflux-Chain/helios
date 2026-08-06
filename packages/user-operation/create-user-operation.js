import {hexValue} from '@ethersproject/bytes'
import {EIP7702_FACTORY_MARKER} from './packing.js'

export function createUserOperationForEstimate({
  sender,
  nonce,
  callData,
  maxFeePerGas,
  maxPriorityFeePerGas,
  signature,
  paymaster,
  authorization,
}) {
  return {
    sender,
    nonce: hexValue(nonce),
    callData,
    callGasLimit: '0x0',
    verificationGasLimit: '0x0',
    preVerificationGas: '0x0',
    maxFeePerGas: hexValue(maxFeePerGas),
    maxPriorityFeePerGas: hexValue(maxPriorityFeePerGas),
    signature,
    ...(paymaster
      ? {
          paymaster,
          paymasterVerificationGasLimit: '0x0',
          paymasterPostOpGasLimit: '0x0',
          paymasterData: '0x',
        }
      : {}),
    ...(authorization
      ? {
          factory: EIP7702_FACTORY_MARKER,
          factoryData: '0x',
          authorization,
        }
      : {}),
  }
}
