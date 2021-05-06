// This was ported from https://github.com/MaiaVictor/eth-lib, with some minor
// modifications to ESM module. It is licensed under MIT:
//
// Copyright 2017 Victor Maia
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import * as Bytes from '@cfxjs/bytes'
import * as Nat from '@cfxjs/nat'
import elliptic from 'elliptic'
import {keccak256, keccak256s} from '@cfxjs/keccak'
import {Buffer} from 'buffer'
import {randomInt} from '@cfxjs/utils'
import {
  NULL_HEX_ADDRESS,
  INTERNAL_CONTRACTS_HEX_ADDRESS,
  ADDRESS_TYPES,
} from '@cfxjs/fluent-wallet-consts'

const secp256k1 = elliptic.ec('secp256k1')

const create = entropy => {
  const innerHex = keccak256(
    Bytes.concat(Bytes.random(32), entropy || Bytes.random(32)),
  )
  const middleHex = Bytes.concat(
    Bytes.concat(Bytes.random(32), innerHex),
    Bytes.random(32),
  )
  const outerHex = keccak256(middleHex)
  return fromPrivate(outerHex)
}

const toChecksum = address => {
  const addressHash = keccak256s(address.slice(2))
  let checksumAddress = '0x'
  for (let i = 0; i < 40; i++)
    checksumAddress +=
      parseInt(addressHash[i + 2], 16) > 7
        ? address[i + 2].toUpperCase()
        : address[i + 2]
  return checksumAddress
}

const fromPrivate = privateKey => {
  const buffer = Buffer.from(privateKey.slice(2), 'hex')
  const ecKey = secp256k1.keyFromPrivate(buffer)
  const publicKey = '0x' + ecKey.getPublic(false, 'hex').slice(2)
  const publicHash = keccak256(publicKey)
  const address = toChecksum('0x' + publicHash.slice(-40))
  return {
    address: address,
    privateKey: privateKey,
  }
}

const encodeSignature = ([v, r, s]) => Bytes.flatten([r, s, v])

const decodeSignature = hex => [
  Bytes.slice(64, Bytes.length(hex), hex),
  Bytes.slice(0, 32, hex),
  Bytes.slice(32, 64, hex),
]

const makeSigner = addToV => (hash, privateKey) => {
  const signature = secp256k1
    .keyFromPrivate(Buffer.from(privateKey.slice(2), 'hex'))
    .sign(Buffer.from(hash.slice(2), 'hex'), {canonical: true})
  return encodeSignature([
    Nat.fromString(Bytes.fromNumber(addToV + signature.recoveryParam)),
    Bytes.pad(32, Bytes.fromNat('0x' + signature.r.toString(16))),
    Bytes.pad(32, Bytes.fromNat('0x' + signature.s.toString(16))),
  ])
}

const sign = makeSigner(27) // v=27|28 instead of 0|1...

const recover = (hash, signature) => {
  const vals = decodeSignature(signature)
  const vrs = {
    v: Bytes.toNumber(vals[0]),
    r: vals[1].slice(2),
    s: vals[2].slice(2),
  }
  const ecPublicKey = secp256k1.recoverPubKey(
    Buffer.from(hash.slice(2), 'hex'),
    vrs,
    vrs.v < 2 ? vrs.v : 1 - (vrs.v % 2),
  ) // because odd vals mean v=0... sadly that means v=0 means v=1... I hate that
  const publicKey = '0x' + ecPublicKey.encode('hex', false).slice(2)
  const publicHash = keccak256(publicKey)
  const address = toChecksum('0x' + publicHash.slice(-40))
  return address
}

export const toAccountAddress = address => {
  return address.replace(/^0x./, '0x1')
}

export const toContractAddress = address => {
  return address.replace(/^0x./, '0x8')
}

export const randomHexAddress = (type, entropy) => {
  if (type && !ADDRESS_TYPES.includes(type))
    throw new Error(`Invalid address type ${type}`)
  if (type === 'builtin')
    return INTERNAL_CONTRACTS_HEX_ADDRESS[
      randomInt(INTERNAL_CONTRACTS_HEX_ADDRESS.length)
    ]
  if (type === 'null') return NULL_HEX_ADDRESS
  const addr = create(entropy).address
  if (type === 'user') return toAccountAddress(addr)
  if (type === 'contract') return toContractAddress(addr)
  return addr
}

export const isHexAddress = address => /^0x[0-9a-fA-F]{40}$/.test(address)
export const isUserHexAddress = address => address.startsWith('0x1')
export const isContractAddress = address => address.startsWith('0x8')
export const isBuiltInAddress = address =>
  INTERNAL_CONTRACTS_HEX_ADDRESS.includes(address.toLowerCase())
export const isNullHexAddress = address => address === NULL_HEX_ADDRESS
export const isCfxHexAddress = address =>
  isUserHexAddress(address) ||
  isContractAddress(address) ||
  isBuiltInAddress(address) ||
  isNullHexAddress(address)

export const validateHexAddress = (address, type) => {
  if (typeof address !== 'string')
    throw new Error('Invalid address, must be a 0x-prefixed string')
  if (!address.startsWith('0x'))
    throw new Error('Invalid address, must be a 0x-prefixed string')

  if (!isHexAddress(address)) return false
  if (type === 'eth') return true
  if (type === 'user') return isUserHexAddress(address)
  if (type === 'contract') return isContractAddress(address)
  if (type === 'builtin') return isBuiltInAddress(address)
  if (type === 'null') return isNullHexAddress(address)
  return isCfxHexAddress(address)
}

export const randomAddressType = () => {
  return ADDRESS_TYPES[randomInt(ADDRESS_TYPES.length)]
}

export const randomCfxHexAddress = entropy => {
  return randomHexAddress(randomAddressType(), entropy)
}

export const randomPrivateKey = entropy => {
  return create(entropy).privateKey
}

export const validatePrivateKey = privateKey => {
  let valid = false
  try {
    const rst = fromPrivate(privateKey)
    valid = Boolean(rst.address)
  } catch (err) {
    valid = false
  }

  return valid
}

export {
  create,
  toChecksum,
  fromPrivate,
  sign,
  makeSigner,
  recover,
  encodeSignature,
  decodeSignature,
}
