import {BigNumber} from '@ethersproject/bignumber'
import {hexDataLength, hexDataSlice} from '@ethersproject/bytes'

const PAYMASTER_DATA_LENGTH = 97
const DELEGATE_ADDRESS_LENGTH = 20
const VALID_UNTIL_OFFSET = 26
const TIMESTAMP_LENGTH = 6

/**
 * Decodes:
 * delegation(20) || validAfter(6) || validUntil(6) || signature(65).
 */
export function decodeVerifyingPaymasterData(paymasterData) {
  const dataLength = hexDataLength(paymasterData)

  if (dataLength !== PAYMASTER_DATA_LENGTH) {
    throw new Error(
      `Invalid Verifying Paymaster data length: ${dataLength} bytes`,
    )
  }

  return {
    delegateAddress: hexDataSlice(paymasterData, 0, DELEGATE_ADDRESS_LENGTH),
    validUntil: BigNumber.from(
      hexDataSlice(
        paymasterData,
        VALID_UNTIL_OFFSET,
        VALID_UNTIL_OFFSET + TIMESTAMP_LENGTH,
      ),
    ).toNumber(),
  }
}
