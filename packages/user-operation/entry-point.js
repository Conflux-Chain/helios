import {hexValue} from '@ethersproject/bytes'
import {entryPointV08Interface} from '@fluent-wallet/contract-abis/entry-point-v08.js'
import {toPackedUserOperation} from './packing.js'

export function encodeGetNonceCall(sender, nonceKey = 0) {
  return entryPointV08Interface.encodeFunctionData('getNonce', [
    sender,
    nonceKey,
  ])
}

export function decodeGetNonceResult(result) {
  const [nonce] = entryPointV08Interface.decodeFunctionResult(
    'getNonce',
    result,
  )

  return hexValue(nonce)
}

export function encodeGetUserOpHashCall(userOperation) {
  return entryPointV08Interface.encodeFunctionData('getUserOpHash', [
    toPackedUserOperation(userOperation),
  ])
}

export function decodeGetUserOpHashResult(result) {
  const [userOpHash] = entryPointV08Interface.decodeFunctionResult(
    'getUserOpHash',
    result,
  )

  return userOpHash
}
