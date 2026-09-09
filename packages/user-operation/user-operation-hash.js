import {_TypedDataEncoder} from '@ethersproject/hash'
import {toPackedUserOperation} from './packing.js'

const PACKED_USER_OPERATION_TYPES = {
  PackedUserOperation: [
    {name: 'sender', type: 'address'},
    {name: 'nonce', type: 'uint256'},
    {name: 'initCode', type: 'bytes'},
    {name: 'callData', type: 'bytes'},
    {name: 'accountGasLimits', type: 'bytes32'},
    {name: 'preVerificationGas', type: 'uint256'},
    {name: 'gasFees', type: 'bytes32'},
    {name: 'paymasterAndData', type: 'bytes'},
  ],
}

export function getUserOperationTypedData({
  chainId,
  entryPointAddress,
  userOperation,
}) {
  const packedUserOperation = toPackedUserOperation(userOperation, {
    forHash: true,
  })

  return {
    domain: {
      name: 'ERC4337',
      version: '1',
      chainId,
      verifyingContract: entryPointAddress,
    },
    types: PACKED_USER_OPERATION_TYPES,
    primaryType: 'PackedUserOperation',
    message: {
      sender: packedUserOperation.sender,
      nonce: packedUserOperation.nonce,
      initCode: packedUserOperation.initCode,
      callData: packedUserOperation.callData,
      accountGasLimits: packedUserOperation.accountGasLimits,
      preVerificationGas: packedUserOperation.preVerificationGas,
      gasFees: packedUserOperation.gasFees,
      paymasterAndData: packedUserOperation.paymasterAndData,
    },
  }
}

export function getUserOperationHash(parameters) {
  const {domain, types, message} = getUserOperationTypedData(parameters)

  return _TypedDataEncoder.hash(domain, types, message)
}
