import {BigNumber} from '@ethersproject/bignumber'
import {hexConcat, hexZeroPad} from '@ethersproject/bytes'

function encodeUint128(value) {
  return hexZeroPad(BigNumber.from(value ?? 0).toHexString(), 16)
}

export function packAccountGasLimits({verificationGasLimit, callGasLimit}) {
  return hexConcat([
    encodeUint128(verificationGasLimit),
    encodeUint128(callGasLimit),
  ])
}

export function packGasFees({maxPriorityFeePerGas, maxFeePerGas}) {
  return hexConcat([
    encodeUint128(maxPriorityFeePerGas),
    encodeUint128(maxFeePerGas),
  ])
}

export function packPaymasterAndData({
  paymaster,
  paymasterVerificationGasLimit,
  paymasterPostOpGasLimit,
  paymasterData,
}) {
  if (!paymaster) return '0x'

  return hexConcat([
    paymaster,
    encodeUint128(paymasterVerificationGasLimit),
    encodeUint128(paymasterPostOpGasLimit),
    paymasterData ?? '0x',
  ])
}

export const EIP7702_FACTORY_MARKER = '0x7702'

const EIP7702_FULL_INIT_CODE_MARKER =
  '0x7702000000000000000000000000000000000000'

function isEip7702FactoryMarker(factory) {
  const lowercaseFactory = factory?.toLowerCase()

  return (
    lowercaseFactory === EIP7702_FACTORY_MARKER ||
    lowercaseFactory === EIP7702_FULL_INIT_CODE_MARKER
  )
}

export function buildUserOperationInitCode(
  {factory, factoryData, authorization},
  {forHash = false} = {},
) {
  if (forHash && isEip7702FactoryMarker(factory)) {
    if (!authorization) return EIP7702_FULL_INIT_CODE_MARKER

    return hexConcat([authorization.address, factoryData ?? '0x'])
  }

  if (!factory) return '0x'

  return hexConcat([factory, factoryData ?? '0x'])
}

export function toPackedUserOperation(userOperation, {forHash = false} = {}) {
  const {
    sender,
    nonce = 0,
    callData = '0x',
    verificationGasLimit,
    callGasLimit,
    preVerificationGas = 0,
    maxPriorityFeePerGas,
    maxFeePerGas,
    signature = '0x',
  } = userOperation

  return {
    sender,
    nonce,
    initCode: buildUserOperationInitCode(userOperation, {forHash}),
    callData,
    accountGasLimits: packAccountGasLimits({
      verificationGasLimit,
      callGasLimit,
    }),
    preVerificationGas,
    gasFees: packGasFees({
      maxPriorityFeePerGas,
      maxFeePerGas,
    }),
    paymasterAndData: packPaymasterAndData(userOperation),
    signature,
  }
}
