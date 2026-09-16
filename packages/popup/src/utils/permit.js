import BN from 'bn.js'
import {convertDecimal, toThousands} from '@fluent-wallet/data-format'

// Match both fixed-size and dynamic EIP-712 array type names.
export const EndsWithArrayReg = /\[(?:\d+)?\]$/

/**
 * Check whether an EIP-712 type declares a field with the expected name and type.
 */
const isEip712PrimaryTypeField = (types, primaryType, fieldName, fieldType) =>
  Array.isArray(types?.[primaryType]) &&
  types[primaryType].some(
    ({name, type}) =>
      name === fieldName && (fieldType === undefined || type === fieldType),
  )

const hasFields = (types, typeName, fields) =>
  fields.every(([name, type]) =>
    isEip712PrimaryTypeField(types, typeName, name, type),
  )

const DOMAIN_FIELDS = [
  ['name', 'string'],
  ['chainId', 'uint256'],
  ['verifyingContract', 'address'],
]

const PERMIT_DETAILS_FIELDS = [
  ['token', 'address'],
  ['amount', 'uint160'],
  ['expiration', 'uint48'],
  ['nonce', 'uint48'],
]
const PERMIT_FIELDS = [
  ['owner', 'address'],
  ['spender', 'address'],
  ['value', 'uint256'],
  ['nonce', 'uint256'],
  ['deadline', 'uint256'],
]
const DAI_PERMIT_FIELDS = [
  ['holder', 'address'],
  ['spender', 'address'],
  ['nonce', 'uint256'],
  ['expiry', 'uint256'],
  ['allowed', 'bool'],
]

/**
 * Check that all required message fields are own properties with defined values.
 */
const hasKeys = (value, keys) =>
  value &&
  typeof value === 'object' &&
  keys.every(
    key =>
      Object.prototype.hasOwnProperty.call(value, key) &&
      value[key] !== undefined,
  )

const PERMIT2_TRANSFER_TYPES = {
  PermitTransferFrom: {isBatch: false, isWitness: false},
  PermitBatchTransferFrom: {isBatch: true, isWitness: false},
  PermitWitnessTransferFrom: {isBatch: false, isWitness: true},
  PermitBatchWitnessTransferFrom: {isBatch: true, isWitness: true},
}

const matchesMessage = (types, primaryType, message, fields) =>
  hasFields(types, primaryType, fields) &&
  hasKeys(
    message,
    fields.map(([name]) => name),
  )

// Resolve the amount field through the signed type declarations.
const getAmountBits = (types, primaryType, permissionField, fallback) => {
  const permissionType = permissionField
    ? types[primaryType]?.find(({name}) => name === permissionField)?.type
    : null
  const amountStruct = permissionField
    ? permissionType?.replace(EndsWithArrayReg, '')
    : primaryType
  const amountField = permissionField ? 'amount' : 'value'
  const amountType = types[amountStruct]?.find(
    ({name}) => name === amountField,
  )?.type

  return amountType?.startsWith('uint') ? Number(amountType.slice(4)) : fallback
}

const detectPermit2 = ({types, primaryType, message}) => {
  if (primaryType === 'PermitSingle' || primaryType === 'PermitBatch') {
    const isBatch = primaryType === 'PermitBatch'
    const fields = [
      ['details', isBatch ? 'PermitDetails[]' : 'PermitDetails'],
      ['spender', 'address'],
      ['sigDeadline', 'uint256'],
    ]
    if (
      hasFields(types, 'PermitDetails', PERMIT_DETAILS_FIELDS) &&
      matchesMessage(types, primaryType, message, fields)
    ) {
      return {
        type: 'permit2',
        mode: 'signature-allowance',
        amountBits: getAmountBits(types, primaryType, 'details', 160),
        permissionField: 'details',
        isBatch,
        isWitness: false,
      }
    }
    return null
  }

  if (
    !Object.prototype.hasOwnProperty.call(PERMIT2_TRANSFER_TYPES, primaryType)
  ) {
    return null
  }
  const {isBatch, isWitness} = PERMIT2_TRANSFER_TYPES[primaryType]
  const fields = [
    ['permitted', isBatch ? 'TokenPermissions[]' : 'TokenPermissions'],
    ['spender', 'address'],
    ['nonce', 'uint256'],
    ['deadline', 'uint256'],
  ]
  if (
    hasFields(types, 'TokenPermissions', [
      ['token', 'address'],
      ['amount', 'uint256'],
    ]) &&
    matchesMessage(types, primaryType, message, fields) &&
    (!isWitness || hasKeys(message, ['witness']))
  ) {
    return {
      type: 'permit2',
      mode: 'signature-transfer',
      amountBits: getAmountBits(types, primaryType, 'permitted', 256),
      permissionField: 'permitted',
      isBatch,
      isWitness,
    }
  }
  return null
}

/**
 * Identify supported permit shapes and describe their display semantics.
 * The result contains no payload; callers retain the original typed data.
 */
export const detectPermitType = (options = {}) => {
  const {typedData} = options || {}
  const {types = {}, domain = {}, primaryType, message = {}} = typedData || {}

  // Only attribute a permit to a contract that is included in the signed domain.
  if (
    !hasFields(types, 'EIP712Domain', DOMAIN_FIELDS) ||
    typeof domain?.verifyingContract !== 'string' ||
    !domain.verifyingContract
  ) {
    return null
  }

  if (domain.name === 'Permit2') {
    const permit2 = detectPermit2({types, primaryType, message})
    if (permit2) return permit2
  }

  if (primaryType !== 'Permit') return null
  for (const [mode, fields] of [
    ['normal-permit', PERMIT_FIELDS],
    ['dai-permit', DAI_PERMIT_FIELDS],
  ]) {
    if (matchesMessage(types, primaryType, message, fields)) {
      return {
        type: 'permit',
        mode,
        amountBits: getAmountBits(types, primaryType, null, 256),
        permissionField: null,
        isBatch: false,
        isWitness: false,
      }
    }
  }
  return null
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
  if (!permitType) return null

  const {message, domain} = typedData
  const {amountBits, permissionField, isBatch, mode} = permitType
  let permissions

  if (permissionField) {
    const permissionList = message[permissionField]
    permissions = Array.isArray(permissionList)
      ? permissionList
      : permissionList
      ? [permissionList]
      : []
  } else {
    permissions = [
      {
        amount:
          mode === 'dai-permit'
            ? message.allowed
              ? new BN(1).ushln(amountBits).subn(1).toString(10)
              : '0'
            : message.value,
        token: domain.verifyingContract,
      },
    ]
  }

  return {
    permissions,
    amountBits,
    isBatch,
    spender: message.spender,
    tokenCount: permissions.length,
  }
}
