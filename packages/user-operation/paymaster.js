import {BigNumber} from '@ethersproject/bignumber'
import {hexDataSlice} from '@ethersproject/bytes'

/**
 * Decodes validUntil from:
 * validAfter(6) || validUntil(6) || signature(65).
 */
export function decodeVerifyingPaymasterValidUntil(paymasterData) {
  return BigNumber.from(hexDataSlice(paymasterData, 6, 12)).toNumber()
}
