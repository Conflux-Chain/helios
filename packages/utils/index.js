import randombytes from 'randombytes'
import {Buffer} from 'buffer'
import BN from 'bn.js'
import {ParsedMessage} from '@spruceid/siwe-parser'

export const randomHex = function (size) {
  return '0x' + randombytes(size).toString('hex')
}

export const randomInt = function (a) {
  return Math.floor(Math.random() * a)
}

import {default as stripHexPrefix} from 'strip-hex-prefix'
import {default as isHexPrefixed} from 'is-hex-prefixed'
export {default as stripHexPrefix} from 'strip-hex-prefix'
export {default as isHexPrefixed} from 'is-hex-prefixed'

/**
 * Returns a buffer filled with 0s.
 * @param bytes the number of bytes the buffer should be
 */
export const zeros = function (bytes) {
  return Buffer.allocUnsafe(bytes).fill(0)
}

/**
 * Pads a `String` to have an even length
 * @param {String} value
 * @return {String} output
 */
export function padToEven(value) {
  var a = value // eslint-disable-line

  if (typeof a !== 'string') {
    throw new Error(
      `[@fluent-wallet/utils] while padding to even, value must be string, is currently ${typeof a}, while padToEven.`,
    )
  }

  if (a.length % 2) {
    a = `0${a}`
  }

  return a
}

/**
 * Converts an `Number` to a `Buffer`
 * @param {Number} i
 * @return {Buffer}
 */
export function intToBuffer(i) {
  const hex = intToHex(i)

  return new Buffer(padToEven(hex.slice(2)), 'hex')
}

/**
 * Attempts to turn a value into a `Buffer`. As input it supports `Buffer`, `String`, `Number`, null/undefined, `BN` and other objects with a `toArray()` method.
 * @param v the value
 */
export const toBuffer = function (v) {
  if (!Buffer.isBuffer(v)) {
    if (Array.isArray(v)) {
      v = Buffer.from(v)
    } else if (typeof v === 'string') {
      if (isHexString(v)) {
        v = Buffer.from(padToEven(stripHexPrefix(v)), 'hex')
      } else {
        throw new Error(
          `Cannot convert string to buffer. toBuffer only supports 0x-prefixed hex strings and this string was given: ${v}`,
        )
      }
    } else if (typeof v === 'number') {
      v = intToBuffer(v)
    } else if (v === null || v === undefined) {
      v = Buffer.allocUnsafe(0)
    } else if (BN.isBN(v)) {
      v = v.toArrayLike(Buffer)
    } else if (v.toArray) {
      // converts a BN to a Buffer
      v = Buffer.from(v.toArray())
    } else {
      throw new Error('invalid type')
    }
  }
  return v
}

/**
 * Is the string a hex string.
 *
 * @method check if string is hex string of specific length
 * @param {String} value
 * @param {Number} length
 * @returns {Boolean} output the string is a hex string
 */
export function isHexString(value, length) {
  if (typeof value !== 'string' || !value.match(/^0x[0-9A-Fa-f]*$/)) {
    return false
  }

  if (length && value.length !== 2 + 2 * length) {
    return false
  }

  return true
}

/**
 * Interprets a `Buffer` as a signed integer and returns a `BN`. Assumes 256-bit numbers.
 * @param num Signed integer value
 */
export const fromSigned = function (num) {
  return new BN(num).fromTwos(256)
}

/**
 * Converts a `Buffer` into a `0x`-prefixed hex `String`.
 * @param buf `Buffer` object to convert
 */
export const bufferToHex = function (buf) {
  buf = toBuffer(buf)
  return '0x' + buf.toString('hex')
}

/**
 * Converts a `Buffer` to a `Number`.
 * @param buf `Buffer` object to convert
 * @throws If the input number exceeds 53 bits.
 */
export const bufferToInt = function (buf) {
  return new BN(toBuffer(buf)).toNumber()
}

/**
 * Adds "0x" to a given `String` if it does not already start with "0x".
 */
export const addHexPrefix = function (str) {
  if (typeof str !== 'string') {
    return str
  }

  return isHexPrefixed(str) ? str : '0x' + str
}

/**
 * Converts a `BN` to an unsigned integer and returns it as a `Buffer`. Assumes 256-bit numbers.
 * @param num
 */
export const toUnsigned = function (num) {
  return Buffer.from(num.toTwos(256).toArray())
}

/**
 * Converts a `Number` into a hex `String`
 * @param {Number} i
 * @return {String}
 */
export function intToHex(i) {
  const hex = i.toString(16) // eslint-disable-line
  return `0x${hex}`
}

/**
 * Left Pads an `Array` or `Buffer` with leading zeros till it has `length` bytes.
 * Or it truncates the beginning if it exceeds.
 * @param msg the value to pad (Buffer|Array)
 * @param length the number of bytes the output should be
 * @param right whether to start padding form the left or right
 * @return (Buffer|Array)
 */
export const setLengthLeft = function (msg, length, right = false) {
  const buf = zeros(length)
  msg = toBuffer(msg)
  if (right) {
    if (msg.length < length) {
      msg.copy(buf)
      return buf
    }
    return msg.slice(0, length)
  } else {
    if (msg.length < length) {
      msg.copy(buf, length - msg.length)
      return buf
    }
    return msg.slice(-length)
  }
}

export const setLength = setLengthLeft

/**
 * Right Pads an `Array` or `Buffer` with leading zeros till it has `length` bytes.
 * Or it truncates the beginning if it exceeds.
 * @param msg the value to pad (Buffer|Array)
 * @param length the number of bytes the output should be
 * @return (Buffer|Array)
 */
export const setLengthRight = function (msg, length) {
  return setLength(msg, length, true)
}

export const detectSIWEMessage = message => {
  try {
    const sanitizedMessage = stripHexPrefix(message)
    const bytes = new Uint8Array(sanitizedMessage.length / 2)
    for (let i = 0; i < sanitizedMessage.length; i += 2) {
      bytes[i / 2] = Number.parseInt(sanitizedMessage.substr(i, 2), 16)
    }
    const decoder = new TextDecoder('utf-8')

    const decodedMessage = decoder.decode(bytes)

    const parsedMessage = new ParsedMessage(decodedMessage)

    return {
      parsedMessage,
      isSIWEMessage: true,
    }
  } catch (e) {
    return {
      isSIWEMessage: false,
    }
  }
}

const textEncoder = new TextEncoder()

export const utf8ToHex = value => {
  if (typeof value !== 'string') {
    throw new Error(`utf8ToHex expects string input, received ${typeof value}`)
  }
  const bytes = textEncoder.encode(value)
  let hex = ''
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, '0')
  }
  return hex
}

export const toHexString = value => {
  if (Buffer.isBuffer(value)) return value.toString('hex')

  if (typeof value === 'string') {
    if (isHexString(value)) return stripHexPrefix(value)
    return utf8ToHex(value)
  }

  return toBuffer(value).toString('hex')
}

export const hexToBN = value =>
  new BN(stripHexPrefix(value || '0x0') || '0', 16)

/**
 * Converts an unsigned integer-like value into a normalized 0x-prefixed hex quantity string.
 *
 * @example
 * - `toHexQuantity(420)` -> `'0x1a4'`
 * - `toHexQuantity(420n)` -> `'0x1a4'`
 * - `toHexQuantity(new BN('420'))` -> `'0x1a4'`
 * - `toHexQuantity('0x01')` -> `'0x1'`
 * - `toHexQuantity('0x0')` -> `'0x0'`
 *
 * @param value
 * @returns {String}
 */
export const toHexQuantity = value => {
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new Error(
        `toHexQuantity expects unsigned integer number, received ${value}`,
      )
    }

    return intToHex(value)
  }

  if (typeof value === 'bigint') {
    if (value < 0n) {
      throw new Error(
        `toHexQuantity expects unsigned bigint, received ${value}`,
      )
    }

    return `0x${value.toString(16)}`
  }

  if (BN.isBN(value)) {
    if (value.isNeg()) {
      throw new Error(
        `toHexQuantity expects unsigned BN, received ${value.toString(10)}`,
      )
    }

    return `0x${value.toString(16)}`
  }

  if (typeof value === 'string') {
    if (!isHexString(value)) {
      throw new Error(
        `toHexQuantity expects 0x-prefixed hex string, received ${value}`,
      )
    }

    const normalizedHex = stripHexPrefix(value).replace(/^0+/, '')

    return `0x${normalizedHex || '0'}`
  }

  if (typeof value?.toHexString === 'function') {
    return toHexQuantity(value.toHexString())
  }

  throw new Error(`toHexQuantity unsupported type ${typeof value}`)
}

export const prepareEip7702AuthorizationRequests = (
  authorizationList,
  chainId,
  txNonce,
) => {
  const txNonceValue = new BN(stripHexPrefix(toHexQuantity(txNonce)), 16)

  return authorizationList.map((authorization, index) => ({
    ...authorization,
    address: authorization.address.toLowerCase(),
    chainId: toHexQuantity(authorization.chainId ?? chainId),
    nonce: toHexQuantity(
      authorization.nonce ?? txNonceValue.clone().addn(index + 1),
    ),
  }))
}

const EIP7702_DUMMY_AUTHORIZATION_SIGNATURE =
  '0x1111111111111111111111111111111111111111111111111111111111111111'

export const prepareEip7702AuthorizationRequestsForEstimate = (
  authorizationList,
  chainId,
  txNonce,
) =>
  prepareEip7702AuthorizationRequests(authorizationList, chainId, txNonce).map(
    authorization => ({
      ...authorization,
      r: toHexQuantity(
        authorization.r ?? EIP7702_DUMMY_AUTHORIZATION_SIGNATURE,
      ),
      s: toHexQuantity(
        authorization.s ?? EIP7702_DUMMY_AUTHORIZATION_SIGNATURE,
      ),
      yParity: toHexQuantity(authorization.yParity ?? '0x1'),
    }),
  )

const DECIMAL_UNSIGNED_INTEGER_PATTERN = /^\d+$/

export function toUnsignedBN(value) {
  if (BN.isBN(value)) {
    if (value.isNeg()) {
      throw new TypeError(`Invalid unsigned integer "${value}"`)
    }

    return value
  }

  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new TypeError(`Invalid unsigned integer "${value}"`)
    }

    return new BN(value)
  }

  if (typeof value === 'string') {
    if (value.length > 2 && isHexString(value)) {
      return new BN(value.slice(2), 16)
    }

    if (DECIMAL_UNSIGNED_INTEGER_PATTERN.test(value)) {
      return new BN(value, 10)
    }
  }

  throw new TypeError(`Invalid unsigned integer "${String(value)}"`)
}
