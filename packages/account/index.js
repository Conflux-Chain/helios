import {getAddress as toChecksumAddress} from '@ethersproject/address'
import {computeAddress} from '@ethersproject/transactions'
import {Wallet} from '@ethersproject/wallet'
import {randomInt, addHexPrefix, isHexString} from '@fluent-wallet/utils'
import {
  NULL_HEX_ADDRESS,
  INTERNAL_CONTRACTS_HEX_ADDRESS,
  ADDRESS_TYPES,
} from '@fluent-wallet/consts'

/**
 * @param {Object} options - An object that can contain a privateKey property.
 * @param {string} options.pk - A hexadecimal string representing a private key.
 * @return {Wallet} A new Wallet instance.
 */
export const create = ({pk} = {}) => {
  const kp = pk ? new Wallet(pk) : Wallet.createRandom()
  return kp
}
/**
 *
 * @param {string} address hex address
 * @returns {string} checksum address
 */
export const toChecksum = address => toChecksumAddress(addHexPrefix(address)) // compL(addHexPrefix, toChecksumAddress)

/**
 *
 * @param {string} addr
 * @returns {boolean}
 */
export const isChecksummed = addr => {
  try {
    return Boolean(toChecksumAddress(addHexPrefix(addr)))
  } catch (err) {
    return false
  }
}
/**
 * @param {string} pk - private key
 * @returns {Object}
 * @property {string} address
 * @property {string} privateKey
 */
export const fromPrivate = pk => ({
  address: computeAddress(addHexPrefix(pk)), //threadFirst(pk, addHexPrefix, computeAddress),
  privateKey: addHexPrefix(pk),
})

export const toAccountAddress = address => {
  return address.replace(/^0x./, '0x1')
}

export const toContractAddress = address => {
  return address.replace(/^0x./, '0x8')
}

/**
 * Generate a random hex address of the specified type.
 *
 * @param {string} [type] - The type of the address. Can be 'builtin', 'null', 'user', or 'contract'.
 *    If not specified, a random type will be chosen.
 * @param {boolean} [checksum=false] - Whether to return a checksummed address.
 * @throws {Error} If the specified type is invalid.
 * @returns {string} A random hex address.
 */
export const randomHexAddress = (type, checksum = false) => {
  if (type && !ADDRESS_TYPES.includes(type))
    throw new Error(`Invalid address type ${type}`)
  if (type === 'builtin')
    return INTERNAL_CONTRACTS_HEX_ADDRESS[
      randomInt(INTERNAL_CONTRACTS_HEX_ADDRESS.length)
    ]
  if (type === 'null') return NULL_HEX_ADDRESS
  const addr = create().address
  if (type === 'user') return toAccountAddress(addr)
  if (type === 'contract') return toContractAddress(addr)
  if (checksum) return toChecksum(addr)
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

export const randomCfxHexAddress = () => {
  return randomHexAddress(randomAddressType())
}

export const randomPrivateKey = () => {
  return create().privateKey
}

export const validatePrivateKey = privateKey => {
  let valid = false
  try {
    // If the string is not a 64-character hex string, then it is an invalid private key.
    if (!isHexString(addHexPrefix(privateKey), 32)) return false

    const rst = fromPrivate(privateKey)
    valid = Boolean(rst.address)
  } catch (err) {
    valid = false
  }

  return valid
}
