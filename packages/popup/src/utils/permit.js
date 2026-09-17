import BN from 'bn.js'
import {convertDecimal, toThousands} from '@fluent-wallet/data-format'

// Match both fixed-size and dynamic EIP-712 array type names.
export const EndsWithArrayReg = /\[(?:\d+)?\]$/

/**
 * Check whether an EIP-712 type declares a field with the expected name and type.
 */
const hasTypedDataField = (types, typeName, fieldName, fieldType) =>
  Array.isArray(types?.[typeName]) &&
  types[typeName].some(
    ({name, type}) =>
      name === fieldName && (fieldType === undefined || type === fieldType),
  )

const hasFields = (types, typeName, fields) =>
  fields.every(([name, type]) => hasTypedDataField(types, typeName, name, type))

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

// Required permission objects must be usable by the specialized summary.
const hasPermissionData = (value, isBatch, fields) => {
  const isPermission = item =>
    item !== null &&
    typeof item === 'object' &&
    !Array.isArray(item) &&
    hasKeys(
      item,
      fields.map(([name]) => name),
    ) &&
    fields.every(([name]) => item[name] !== null)
  return isBatch
    ? Array.isArray(value) && value.every(isPermission)
    : isPermission(value)
}

const PERMIT2_TRANSFER_TYPES = {
  PermitTransferFrom: {isBatch: false, isWitness: false},
  PermitBatchTransferFrom: {isBatch: true, isWitness: false},
  PermitWitnessTransferFrom: {isBatch: false, isWitness: true},
  PermitBatchWitnessTransferFrom: {isBatch: true, isWitness: true},
}

// Check field declarations and presence, not the validity of message values.
const hasRequiredMessageFields = (types, primaryType, message, fields) =>
  hasFields(types, primaryType, fields) &&
  hasKeys(
    message,
    fields.map(([name]) => name),
  )

// Resolve the amount field through the signed type declarations.
const inferAmountBits = (types, primaryType, permissionField, defaultBits) => {
  const permissionType = permissionField
    ? types[primaryType]?.find(({name}) => name === permissionField)?.type
    : null
  const amountTypeName = permissionField
    ? permissionType?.replace(EndsWithArrayReg, '')
    : primaryType
  const amountField = permissionField ? 'amount' : 'value'
  const amountType = types[amountTypeName]?.find(
    ({name}) => name === amountField,
  )?.type

  return amountType?.startsWith('uint')
    ? Number(amountType.slice(4))
    : defaultBits
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
      hasRequiredMessageFields(types, primaryType, message, fields) &&
      hasPermissionData(message.details, isBatch, PERMIT_DETAILS_FIELDS)
    ) {
      return {
        type: 'permit2',
        mode: 'signature-allowance',
        amountBits: inferAmountBits(types, primaryType, 'details', 160),
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
    hasRequiredMessageFields(types, primaryType, message, fields) &&
    (!isWitness || hasKeys(message, ['witness'])) &&
    hasPermissionData(message.permitted, isBatch, [
      ['token', 'address'],
      ['amount', 'uint256'],
    ])
  ) {
    return {
      type: 'permit2',
      mode: 'signature-transfer',
      amountBits: inferAmountBits(types, primaryType, 'permitted', 256),
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
export const detectPermit = (options = {}) => {
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
    if (hasRequiredMessageFields(types, primaryType, message, fields)) {
      return {
        type: 'permit',
        mode,
        amountBits: inferAmountBits(types, primaryType, null, 256),
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
export const getPermitDisplayData = (typedData, permitDescriptor) => {
  if (!permitDescriptor) return null

  const {message, domain} = typedData
  const {amountBits, permissionField, isBatch, mode} = permitDescriptor
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
  }
}

const DATE_FIELD_NAMES = [
  'deadline',
  'endTime',
  'expiration',
  'expiry',
  'sigDeadline',
  'startTime',
  'validTo',
]
const TOKEN_AMOUNT_FIELD_NAMES = [
  'amount',
  'buyAmount',
  'endAmount',
  'sellAmount',
  'startAmount',
  'value',
]

/** Match familiar field names while restricting where token context comes from. */
export const getPermitFieldDisplay = (typedData, descriptor, path) => {
  const {permissionField, isBatch, type} = descriptor
  const name = path[path.length - 1]
  if (DATE_FIELD_NAMES.includes(name)) return {kind: 'date'}
  const isAmount = TOKEN_AMOUNT_FIELD_NAMES.includes(name)
  if (path.length === 1 && type === 'permit' && isAmount) {
    return {kind: 'amount', tokenAddress: typedData.domain.verifyingContract}
  }

  const isPermissionField =
    permissionField &&
    path[0] === permissionField &&
    (isBatch
      ? path.length === 3 && Number.isInteger(path[1])
      : path.length === 2)
  if (!isPermissionField) return null

  const permissionType = typedData.types[typedData.primaryType]
    ?.find(field => field.name === permissionField)
    ?.type?.replace(EndsWithArrayReg, '')
  if (!hasTypedDataField(typedData.types, permissionType, 'token', 'address'))
    return null
  const permission = isBatch
    ? typedData.message[permissionField]?.[path[1]]
    : typedData.message[permissionField]
  if (isAmount || name === 'token') {
    return {
      kind: isAmount ? 'amount' : 'token',
      tokenAddress: permission?.token,
    }
  }
  return null
}
