import {getAddress as toChecksumAddress} from '@ethersproject/address'
import {computeAddress} from '@ethersproject/transactions'
import {Wallet} from '@ethersproject/wallet'
import {randomInt, addHexPrefix} from '@fluent-wallet/utils'
import {compL, threadFirst} from '@fluent-wallet/compose'
import {
  NULL_HEX_ADDRESS,
  INTERNAL_CONTRACTS_HEX_ADDRESS,
  ADDRESS_TYPES,
} from '@fluent-wallet/consts'

export const create = ({pk} = {}) => {
  const kp = pk ? new Wallet(pk) : Wallet.createRandom()
  return kp
}

export const toChecksum = compL(addHexPrefix, toChecksumAddress)

export const fromPrivate = pk => ({
  address: threadFirst(pk, addHexPrefix, computeAddress),
  privateKey: addHexPrefix(pk),
})

export const toAccountAddress = address => {
  return address.replace(/^0x./, '0x1')
}

export const toContractAddress = address => {
  return address.replace(/^0x./, '0x8')
}

export const randomHexAddress = type => {
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
    const rst = fromPrivate(privateKey)
    valid = Boolean(rst.address)
  } catch (err) {
    valid = false
  }

  return valid
}
