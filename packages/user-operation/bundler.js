import {hexValue, hexZeroPad} from '@ethersproject/bytes'

const QUANTITY_FIELDS = [
  'nonce',
  'callGasLimit',
  'verificationGasLimit',
  'preVerificationGas',
  'maxFeePerGas',
  'maxPriorityFeePerGas',
  'paymasterVerificationGasLimit',
  'paymasterPostOpGasLimit',
]

const DATA_FIELDS = [
  'sender',
  'factory',
  'factoryData',
  'callData',
  'paymaster',
  'paymasterData',
  'signature',
]

export function toBundlerUserOperation(userOperation) {
  const result = {}

  for (const field of DATA_FIELDS) {
    if (userOperation[field] !== undefined) {
      result[field] = userOperation[field]
    }
  }

  for (const field of QUANTITY_FIELDS) {
    if (userOperation[field] !== undefined) {
      result[field] = hexValue(userOperation[field])
    }
  }

  if (userOperation.authorization) {
    const {address, chainId, nonce, r, s, yParity} = userOperation.authorization

    result.eip7702Auth = {
      address,
      chainId: hexValue(chainId),
      nonce: hexValue(nonce),
      r: hexZeroPad(r, 32),
      s: hexZeroPad(s, 32),
      yParity: hexZeroPad(hexValue(yParity), 1),
    }
  }

  return result
}

const ESTIMATED_GAS_FIELDS = [
  'callGasLimit',
  'verificationGasLimit',
  'preVerificationGas',
  'paymasterVerificationGasLimit',
  'paymasterPostOpGasLimit',
]

export function mergeUserOperationGasEstimate(userOperation, gasEstimate) {
  const result = {...userOperation}

  for (const field of ESTIMATED_GAS_FIELDS) {
    if (gasEstimate[field] !== undefined) {
      result[field] = hexValue(gasEstimate[field])
    }
  }

  return result
}
