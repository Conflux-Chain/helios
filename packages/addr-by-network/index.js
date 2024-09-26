import {
  encode,
  decode,
  validateBase32Address,
} from '@fluent-wallet/base32-address'
import {ADDRESS_TYPES} from '@fluent-wallet/consts'
import {fromPrivate} from '@fluent-wallet/account'

const ADDR_TYPE_TO_PREFIX = {
  user: '0x1',
  contract: '0x8',
  null: '0x0',
  builtin: '0x0',
}

/**
 * Converts address between Conflux and Ethereum hex address, or between different
 * Conflux address types.
 *
 * @param {object} options - Options object
 * @param {string} options.address - The address to convert
 * @param {'cfx'|'eth'} options.networkType - The network type of the address
 * @param {number} options.networkId - The network id of the address
 * @param {'user'|'contract'|'null'|'builtin'} options.addressType - The address
 * type of the address, only valid when networkType is 'cfx'
 * @param {string} options.privateKey - The private key of the address, only valid
 * when networkType is 'eth' and address is base32 address
 *
 * @throws {Error} Invalid address, must be a string
 * @throws {Error} Invalid networkType, must be cfx or eth
 * @throws {Error} Invalid networkId, must be a safe integer
 * @throws {Error} Invalid addressType, must be one of user, contract, null, or
 * builtin
 * @throws {Error} Invalid base32 address, address type is invalid
 * @throws {Error} Unable to convert base32 address into eth hex address without
 * private key
 *
 * @returns {string} The converted address
 */
const addrByNetwork = ({
  address,
  networkType,
  networkId,
  addressType,
  privateKey,
} = {}) => {
  if (typeof address !== 'string')
    throw new Error('Invalid address, must be a string')
  if (!['cfx', 'eth'].includes(networkType))
    throw new Error('Invalid networkType, must be cfx or eth')
  if (
    networkId !== undefined &&
    networkId !== null &&
    !Number.isSafeInteger(networkId)
  )
    throw new Error('Invalid networkId, must be a safe integer')
  if (networkType === 'cfx' && !Number.isSafeInteger(networkId))
    throw new Error('Invalid networkId, must be a safe integer')
  if (addressType && !ADDRESS_TYPES.includes(addressType))
    throw new Error(
      `Invalid addressType, must be one of ${ADDRESS_TYPES.toString()}`,
    )

  if (networkType === 'cfx') {
    if (addressType === 'null')
      address = '0x0000000000000000000000000000000000000000'

    if (validateBase32Address(address, networkId, addressType)) return address

    if (address.includes(':')) {
      if (addressType && !validateBase32Address(address, addressType))
        throw new Error('Invalid base32 address, address type is invalid')
      return encode(decode(address).hexAddress, networkId)
    }

    if (!addressType) addressType = 'user'

    return encode(
      address.toLowerCase().replace(/0x./, ADDR_TYPE_TO_PREFIX[addressType]),
      networkId,
    )
  }

  if (networkType === 'eth') {
    if (address.includes(':')) {
      if (privateKey) return fromPrivate(privateKey).address

      throw new Error(
        'Unable to convert base32 address into eth hex address without private key',
      )
    }
    return address
  }
}

export default addrByNetwork
