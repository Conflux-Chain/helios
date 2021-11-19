/* eslint-disable no-unused-vars */
import {default as OriginBig} from 'big.js'
import BN from 'bn.js'
import {stripHexPrefix, isHexPrefixed, addHexPrefix} from '@fluent-wallet/utils'
OriginBig.RM = 0
OriginBig.NE = -19
OriginBig.PE = 30

export const Big = OriginBig
export const CFX_DECIMALS = 18
export const ETH_DECIMALS = 18
export const BTC_DECIMALS = 6
export const USDT_DECIMALS = 8
export const COMMON_DECIMALS = 18
export const GWEI_DECIMALS = 9
export const convertDecimal = (
  numOrStr,
  action = 'divide',
  decimals = COMMON_DECIMALS,
) => {
  if (action === 'divide') {
    return new Big(numOrStr).div(`1e${decimals}`).toString(10)
  } else if (action === 'multiply') {
    return new Big(numOrStr).times(`1e${decimals}`).toString(10)
  }
  return numOrStr
}

export const fromCfxToDrip = numOrStr => {
  return convertDecimal(numOrStr, 'multiply', CFX_DECIMALS)
}

export const fromDripToCfx = numOrStr => {
  return convertDecimal(numOrStr, 'divide', CFX_DECIMALS)
}

export const trimZero = numOrStr => {
  return new Big(numOrStr).toString(10)
}

export const formatDigit = (numOrStr, digit) => {
  const str = trimZero(numOrStr)
  const strArr = str.split('.')
  // no digit
  if (!digit) return numOrStr
  // no decimals or digit < integer length
  else if (!strArr[1] || strArr[0].length >= digit)
    return toThousands(strArr[0])
  else if (strArr[0].length + strArr[1].length <= digit) return toThousands(str)
  else {
    const decimals = strArr[1].substring(0, digit - strArr[0].length)
    return toThousands(trimZero([strArr[0], decimals].join('.')))
  }
}

export const toThousands = (numOrStr, delimiter = ',', prevDelimiter = ',') => {
  let str = trimZero(numOrStr)
  return str
    .replace(new RegExp(prevDelimiter, 'igm'), '')
    .split('.')
    .reduce((acc, cur, index) => {
      if (index) {
        return `${acc}.${cur}`
      } else {
        return cur.replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, `$1${delimiter}`)
      }
    }, '')
}

export const isValidNumber = numOrStr => {
  if (
    !numOrStr ||
    (typeof numOrStr !== 'number' && typeof numOrStr !== 'string') ||
    isNaN(Number(numOrStr))
  ) {
    return false
  }
  return true
}

export const formatHexToDecimal = numOrStr => {
  if (!isValidNumber(numOrStr)) return numOrStr
  return isHexPrefixed(numOrStr)
    ? new BN(stripHexPrefix(numOrStr), 16).toString()
    : numOrStr
}

export const formatDecimalToHex = numOrStr => {
  if (!isValidNumber(numOrStr)) return numOrStr
  return addHexPrefix(new BN(numOrStr, 10).toString(16))
}

// convert api 0x data to value
export const convertDataToValue = (numOrStr, decimals) => {
  if (!isValidNumber(numOrStr)) return numOrStr
  let value = formatHexToDecimal(numOrStr)
  if (decimals) {
    value = convertDecimal(value, 'divide', decimals)
  }
  return value
}

// convert input value to 0x data
export const convertValueToData = (numOrStr, decimals) => {
  if (!isValidNumber(numOrStr)) return numOrStr
  let data = numOrStr
  if (decimals) {
    data = convertDecimal(numOrStr, 'multiply', decimals)
  }
  data = formatDecimalToHex(data)
  return data
}

export const roundBalance = (balance, digit = 6) => {
  if (!isValidNumber(balance)) return balance
  const bNum = new Big(balance)
  return toThousands(bNum.round(digit).toString(10))
}

export const formatBalance = (numOrStr, decimals) => {
  if (!isValidNumber(numOrStr)) return numOrStr
  const balance = convertDataToValue(numOrStr, decimals)
  return roundBalance(balance)
}

export const formatAmount = numOrStr => {
  const str = trimZero(numOrStr)
  const bNum = new Big(numOrStr)
  if (bNum.gte(Big(0)) && bNum.lt(Big(1e6))) {
    return formatDigit(str, 7)
  } else if (bNum.gte(Big(1e6)) && bNum.lt(Big(1e9))) {
    return toThousands(bNum.div(1e6).round(3).toString(10)) + ' M'
  } else if (bNum.gte(Big(1e9)) && bNum.lt(Big(1e12))) {
    return toThousands(bNum.div(1e9).round(3).toString(10)) + ' G'
  } else if (bNum.gte(Big(1e12)) && bNum.lt(Big(1e15))) {
    return toThousands(bNum.div(1e12).round(3).toString(10)) + ' T'
  } else if (bNum.gte(Big(1e15))) {
    return toThousands(bNum.div(1e12).round().toString(10)) + ' T'
  }
}
