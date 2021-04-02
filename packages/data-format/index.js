/* eslint-disable no-unused-vars */
import Big from 'big.js'
Big.RM = 0
Big.NE = -19

export const fromDripToCfx = numOrStr => {
  try {
    const cfx = new Big(numOrStr).div(1e18).toString()
    return cfx
  } catch (e) {
    return numOrStr
  }
}

export const fromCfxToDrip = numOrStr => {
  try {
    const cfx = new Big(numOrStr).times(1e18).toString()
    return cfx
  } catch (e) {
    return numOrStr
  }
}

export const trimZero = numOrStr => {
  try {
    return new Big(numOrStr).toString(10)
  } catch (err) {
    return numOrStr
  }
}

export const formatDigit = (numOrStr, digit) => {
  try {
    const str = trimZero(numOrStr)
    const strArr = str.split('.')
    // no digit
    if (!digit) return numOrStr
    // no decimal or digit < integer length
    else if (!strArr[1] || strArr[0].length >= digit)
      return toThousands(strArr[0])
    else if (strArr[0].length + strArr[1].length <= digit)
      return toThousands(str)
    else {
      const decimal = strArr[1].substring(0, digit - strArr[0].length)
      return toThousands(trimZero([strArr[0], decimal].join('.')))
    }
  } catch (e) {
    return numOrStr
  }
}

export const toThousands = (numOrStr, delimiter = ',', prevDelimiter = ',') => {
  try {
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
  } catch (e) {
    return numOrStr
  }
}

export const formatAmount = numOrStr => {
  try {
    const bNum = new Big(numOrStr)
    const str = trimZero(numOrStr)
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
  } catch (e) {
    return numOrStr
  }
}

// only format the address not containing networkid
export const formatAddress = address => {
  if (!address || typeof address !== 'string') return address
  const arr = address.split(':')
  if (arr.length !== 2) return address
  const length = arr[1].length
  if (length !== 42) return address

  return `${arr[0]}:${arr[1].substring(0, 4)}...${arr[1].substring(length - 4)}`
}

export default Big
