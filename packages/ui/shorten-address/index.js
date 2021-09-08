/* eslint-disable no-unused-vars */
import {isNegative, isString} from '@fluent-wallet/checks'
import {validateBase32Address, decode} from '@fluent-wallet/base32-address'
import {isHexAddress} from '@fluent-wallet/account'

export const getEllipsStr = (str, frontNum, endNum) => {
  if (!isString(str) || isNegative(frontNum) || isNegative(endNum)) {
    throw new Error('Invalid args')
  }
  const length = str.length
  if (frontNum + endNum >= length) {
    return str.substring(0, length)
  }
  return (
    str.substring(0, frontNum) + '...' + str.substring(length - endNum, length)
  )
}

export const shortenCfxAddress = address => {
  if (!validateBase32Address(address)) {
    throw new Error('Invalid conflux address')
  }
  const arr = address.split(':')
  if (arr.length !== 2) {
    throw new Error('Only shorten the conflux address not containing type')
  }
  const {netId} = decode(address)
  const secondStr = getEllipsStr(arr[1], 3, netId === 1029 ? 8 : 4)

  return `${arr[0]}:${secondStr}`
}

export const shortenEthAddress = address => {
  if (!isHexAddress(address)) {
    throw new Error('Invalid ethereum address')
  }
  return getEllipsStr(address, 6, 4)
}
