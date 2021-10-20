/* eslint-disable no-unused-vars */
import {default as OriginBig} from 'big.js'
OriginBig.RM = 0
OriginBig.NE = -19

export const Big = OriginBig
export const CFX_DECIMAL = 18
export const BTC_DECIMAL = 6
export const USDT_DECIMAL = 8
export const COMMON_DECIMAL = 18

export const convertDecimal = (
  numOrStr,
  action = 'divide',
  decimal = COMMON_DECIMAL,
) => {
  if (action === 'divide') {
    return new Big(numOrStr).div(`1e${decimal}`).toString(10)
  } else if (action === 'multiply') {
    return new Big(numOrStr).times(`1e${decimal}`).toString(10)
  }
  return numOrStr
}

export const fromCfxToDrip = numOrStr => {
  return convertDecimal(numOrStr, 'multiply', CFX_DECIMAL)
}

export const fromDripToCfx = numOrStr => {
  return convertDecimal(numOrStr, 'divide', CFX_DECIMAL)
}

export const trimZero = numOrStr => {
  return new Big(numOrStr).toString(10)
}

export const formatDigit = (numOrStr, digit) => {
  const str = trimZero(numOrStr)
  const strArr = str.split('.')
  // no digit
  if (!digit) return numOrStr
  // no decimal or digit < integer length
  else if (!strArr[1] || strArr[0].length >= digit)
    return toThousands(strArr[0])
  else if (strArr[0].length + strArr[1].length <= digit) return toThousands(str)
  else {
    const decimal = strArr[1].substring(0, digit - strArr[0].length)
    return toThousands(trimZero([strArr[0], decimal].join('.')))
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

export const formatBalance = numOrStr => {
  const bNum = new Big(numOrStr)
  return toThousands(bNum.round(6).toString(10))
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
