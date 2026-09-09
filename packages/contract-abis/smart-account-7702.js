import {Interface} from '@ethersproject/abi'

export const SMART_ACCOUNT_7702_ABI = [
  'function execute(address target, uint256 value, bytes data)',
  'function executeBatch((address target, uint256 value, bytes callData)[] calls)',
]

export const smartAccount7702Interface = new Interface(SMART_ACCOUNT_7702_ABI)
