import BN from 'bn.js'
import {convertDecimal, toThousands} from '@fluent-wallet/data-format'

// Match both fixed-size and dynamic EIP-712 array type names.
export const EndsWithArrayReg = /\[(?:\d+)?\]$/

const UINT_MAX_BITS = {
  permit: 256,
  permit2: 160,
}

/**
 * Parse a decimal or hexadecimal amount without throwing on invalid input.
 */
const toBN = value => {
  if (value === undefined || value === null || value === '') return null

  try {
    const stringValue = String(value)
    return /^0x/i.test(stringValue)
      ? new BN(stringValue.slice(2) || '0', 16)
      : new BN(stringValue, 10)
  } catch {
    return null
  }
}

/**
 * Check whether an amount is exactly the maximum unsigned integer for its type.
 */
const isMaxUint = (value, bits) => {
  if (!Number.isInteger(bits) || bits <= 0) return false

  return value.eq(new BN(1).ushln(bits).subn(1))
}

/**
 * Format a raw permit amount as a token amount or an unlimited label.
 */
export const formatPermitAmount = (
  amount,
  decimals,
  amountBits,
  unlimitedLabel,
) => {
  const parsedAmount = toBN(amount)
  if (!parsedAmount) return '-'
  if (isMaxUint(parsedAmount, amountBits)) return unlimitedLabel

  const decimalAmount = parsedAmount.toString(10)

  const tokenDecimals = Number(decimals ?? 0)
  if (!Number.isInteger(tokenDecimals) || tokenDecimals < 0) return '-'
  const displayAmount = tokenDecimals
    ? convertDecimal(decimalAmount, 'divide', tokenDecimals)
    : decimalAmount

  return toThousands(displayAmount) || displayAmount
}

/**
 * Normalize supported permit payloads into the fields used by the approval UI.
 */
export const getPermitDisplayData = (typedData, permitType) => {
  const message = typedData?.message || {}
  const domain = typedData?.domain || {}
  const types = typedData?.types || {}
  const primaryType = typedData?.primaryType || ''

  let amountBits = UINT_MAX_BITS[permitType?.type]
  if (permitType?.type === 'permit2') {
    const isAllowance = permitType.mode === 'signature-allowance'
    const permissionList = isAllowance ? message.details : message.permitted
    const permissionType = types[primaryType]?.find(item =>
      isAllowance ? item.name === 'details' : item.name === 'permitted',
    )?.type
    if (permissionType) {
      const realType = permissionType.replace(EndsWithArrayReg, '')
      const amountType = types[realType]?.find(
        item => item.name === 'amount',
      )?.type
      if (amountType?.startsWith('uint')) {
        amountBits = Number(amountType.replace('uint', ''))
      }
    }
    const permissions = Array.isArray(permissionList)
      ? permissionList
      : permissionList
      ? [permissionList]
      : []

    return {
      permissions,
      amountBits,
      isBatch: Boolean(permitType.isBatch),
      spender: message.spender,
      tokenCount: permissions.length,
    }
  }
  const amountType = types[primaryType]?.find(
    item => item.name === 'value',
  )?.type
  if (amountType?.startsWith('uint')) {
    amountBits = Number(amountType.replace('uint', ''))
  }
  const isDaiPermit = permitType?.mode === 'dai-permit'
  return {
    permissions: [
      {
        amount: isDaiPermit
          ? message.allowed
            ? new BN(1).ushln(UINT_MAX_BITS.permit).subn(1).toString(10)
            : '0'
          : message.value,
        token: domain.verifyingContract,
      },
    ],
    amountBits,
    isBatch: false,
    spender: message.spender,
    tokenCount: 1,
  }
}
