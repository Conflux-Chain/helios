import {Interface} from '@ethersproject/abi'

export const ENTRY_POINT_V08_ABI = [
  'function getNonce(address sender, uint192 key) view returns (uint256)',
  'function getUserOpHash((address sender, uint256 nonce, bytes initCode, bytes callData, bytes32 accountGasLimits, uint256 preVerificationGas, bytes32 gasFees, bytes paymasterAndData, bytes signature) userOp) view returns (bytes32)',
]

export const entryPointV08Interface = new Interface(ENTRY_POINT_V08_ABI)
