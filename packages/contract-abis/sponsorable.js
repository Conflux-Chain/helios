import {Interface} from '@ethersproject/abi'

export const SPONSORABLE_ABI = [
  'function canSponsor((address sender,uint256 nonce,bytes initCode,bytes callData,bytes32 accountGasLimits,uint256 preVerificationGas,bytes32 gasFees,bytes paymasterAndData,bytes signature) userOp) view returns (bool sponsorable,string reason)',
]

export const sponsorableInterface = new Interface(SPONSORABLE_ABI)
