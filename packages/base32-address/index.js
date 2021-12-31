import {randomHexAddress, randomAddressType} from '@fluent-wallet/account'
import {addHexPrefix, stripHexPrefix} from '@fluent-wallet/utils'
import {address} from 'js-conflux-sdk'
import {memoize, memoize1} from '@thi.ng/memoize'
import {LRUCache} from '@thi.ng/cache'

export const encode = memoize(
  (hexAddress, netId, verbose) =>
    address.encodeCfxAddress(addHexPrefix(hexAddress), netId, verbose),
  new LRUCache(null, {maxlen: 200}),
)

const decodeRaw = a => {
  try {
    const rst = address.decodeCfxAddress(a)
    rst.hexAddress = addHexPrefix(rst.hexAddress.toString('hex'))
    return rst
  } catch (err) {
    if (
      err?.message?.includes(
        'Invalid attempt to destructure non-iterable instance',
      )
    )
      throw new Error('Invalid checksum')
    throw err
  }
}

export const decode = memoize1(decodeRaw, new LRUCache(null, {maxlen: 200}))

export function validateBase32Address(address, ...args) {
  let netId, type, decoded

  let valid = false

  if (args[0] !== undefined && args[0] !== null) {
    if (Number.isSafeInteger(args[0])) netId = args[0]
    else if (typeof args[0] === 'string') type = args[0]
    else
      throw new Error(
        'Invalid type or networkId, type must be string, networkId must be number',
      )
  }

  if (args[1] !== undefined && args[1] !== null) {
    if (Number.isSafeInteger(args[1])) netId = args[1]
    else if (typeof args[1] === 'string') type = args[1]
    else
      throw new Error(
        'Invalid type or networkId, type must be string, networkId must be number',
      )
  }

  try {
    decoded = decode(address)
    valid = true
    if (netId !== undefined && netId !== decoded.netId) valid = false
    if (type !== undefined && type !== decoded.type) valid = false
  } catch (err) {
    valid = false
  }

  return valid
}

export const randomBase32Address = (...args) => {
  let netId, type

  if (args[0] !== undefined && args[0] !== null) {
    if (Number.isSafeInteger(args[0])) netId = args[0]
    else if (typeof args[0] === 'string') type = args[0]
    else
      throw new Error(
        'Invalid type or networkId, type must be string, networkId must be number',
      )
  }

  if (args[1] !== undefined && args[1] !== null) {
    if (Number.isSafeInteger(args[1])) netId = args[1]
    else if (typeof args[1] === 'string') type = args[1]
    else
      throw new Error(
        'Invalid type or networkId, type must be string, networkId must be number',
      )
  }

  if (type === undefined) type = randomAddressType()
  if (netId === undefined) netId = 1029

  const hexAddress = stripHexPrefix(randomHexAddress(type))

  return encode(Buffer.from(hexAddress, 'hex'), netId)
}
