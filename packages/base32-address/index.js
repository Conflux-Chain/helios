import {
  encode as encodeBase32,
  decode as decodeBase32,
  toWords,
  fromWords,
} from '@cfxjs/base32'
import {randomHexAddress} from '@cfxjs/account'

const VERSION_BYTE = 0
const NET_ID_LIMIT = 0xffffffff

function encodeNetId(netId) {
  if (!Number.isInteger(netId)) {
    throw new Error('netId should be passed as an integer')
  }
  if (netId <= 0 || netId > NET_ID_LIMIT) {
    throw new Error('netId should be passed as in range [1, 0xFFFFFFFF]')
  }

  switch (netId) {
    case 1:
      return 'cfxtest'
    case 1029:
      return 'cfx'
    default:
      return `net${netId}`
  }
}

function isValidNetId(netId) {
  return /^([1-9]\d*)$/.test(netId) && Number(netId) <= NET_ID_LIMIT
}

function decodeNetId(payload) {
  switch (payload) {
    case 'cfxtest':
      return 1
    case 'cfx':
      return 1029
    default: {
      const prefix = payload.slice(0, 3)
      const netId = payload.slice(3)
      if (prefix !== 'net' || !isValidNetId(netId)) {
        throw new Error(
          "netId prefix should be passed by 'cfx', 'cfxtest' or 'net[n]' ",
        )
      }
      if (Number(netId) === 1 || Number(netId) === 1029) {
        throw new Error('net1 or net1029 are invalid')
      }
      return Number(netId)
    }
  }
}

function encodePayload(hexAddress) {
  return Buffer.concat([Buffer.from([VERSION_BYTE]), hexAddress])
}

function decodePayload(payload) {
  if (payload[0] !== VERSION_BYTE) {
    throw new Error('Can not recognize version byte')
  }
  return Buffer.from(payload.slice(1))
}

function getAddressType(hexAddress) {
  if (hexAddress.length < 1) {
    throw new Error('Empty payload in address')
  }

  switch (hexAddress[0] & 0xf0) {
    case 0x10:
      return 'user'
    case 0x80:
      return 'contract'
    case 0x00:
      for (const x of hexAddress) {
        if (x !== 0x00) {
          return 'builtin'
        }
      }
      return 'null'
    default:
      throw new Error('hexAddress should start with 0x0, 0x1 or 0x8')
  }
}

export function encode(hexAddress, netId, verbose = false) {
  if (!(hexAddress instanceof Buffer)) {
    throw new Error('hexAddress should be passed as a Buffer')
  }

  if (hexAddress.length < 20) {
    throw new Error('hexAddress should be at least 20 bytes')
  }

  const addressType = getAddressType(hexAddress)

  let encodedAddress = encodeBase32(
    encodeNetId(netId),
    toWords(encodePayload(hexAddress)),
  )

  if (verbose) {
    const [prefix, payload] = encodedAddress.split(':')
    encodedAddress = [prefix, `type.${addressType}`, payload]
      .join(':')
      .toUpperCase()
  }
  return encodedAddress
}

export function decode(address) {
  // don't allow mixed case
  const lowered = address.toLowerCase()
  const uppered = address.toUpperCase()
  if (address !== lowered && address !== uppered) {
    throw new Error('Mixed-case address ' + address)
  }

  const splits = address.split(':')
  let shouldHaveType = ''

  let reducedAddress = address
  if (splits.length === 3) {
    shouldHaveType = splits[1]
    reducedAddress = [splits[0], splits[2]].join(':')
  }

  const result = decodeBase32(reducedAddress)
  const data = fromWords(result.words)
  if (data.length < 1) {
    throw new Error('Empty payload in address')
  }

  const returnValue = {
    hexAddress: decodePayload(data),
    netId: decodeNetId(result.prefix),
    type: getAddressType(decodePayload(data)),
  }

  if (
    shouldHaveType !== '' &&
    `type.${returnValue.type}` !== shouldHaveType.toLowerCase()
  ) {
    throw new Error("Type of address doesn't match")
  }

  return returnValue
}

export function validateBase32Address(address, ...args) {
  let netId, type, decoded

  let valid = false

  if (args[0] !== undefined) {
    if (typeof args[0] === 'number') netId = args[0]
    if (typeof args[0] === 'string') type = args[0]
    if (args[1] !== undefined) {
      if (typeof args[1] === 'number') netId = args[1]
      if (typeof args[1] === 'string') type = args[1]
    }
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

  if (args[0] !== undefined) {
    if (typeof args[0] === 'number') netId = args[0]
    if (typeof args[0] === 'string') type = args[0]
    if (args[1] !== undefined) {
      if (typeof args[1] === 'number') netId = args[1]
      if (typeof args[1] === 'string') type = args[1]
    }
  }

  if (type === undefined) type = 'user'
  if (netId === undefined) netId = 1029

  const hexAddress = randomHexAddress()
  if (type === 'user') hexAddress.replace(/0x\d/, '0x1')
  else if (type === 'contract') hexAddress.replace(/0x\d/, '0x8')
  else if (type === 'builtin') hexAddress.replace(/0x\d/, '0x0')

  return encode(hexAddress, netId)
}
