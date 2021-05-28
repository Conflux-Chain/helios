import {encode, decode, validateBase32Address} from '@cfxjs/base32-address'
import {ADDRESS_TYPES} from '@cfxjs/fluent-wallet-consts'
import {fromPrivate} from '@cfxjs/account'

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
      'Invalid addressType, must be one of ' + ADDRESS_TYPES.toString(),
    )

  if (networkType === 'cfx') {
    if (validateBase32Address(address, networkId, addressType)) return address
    if (address.includes(':')) {
      return encode(decode(address).hexAddress, networkId, true)
    }

    return encode(address.toLowerCase().replace(/0x./, '0x1'), networkId, true)
  }

  if (networkType === 'eth') {
    if (address.includes(':')) {
      if (privateKey) return fromPrivate(privateKey).address
      else
        throw new Error(
          'Unable to convert base32 address into eth hex address without private key',
        )
    } else return address
  }
}

export default addrByNetwork
