/* eslint-disable no-unused-vars */
import Big from 'big.js'
Big.RM = 0
Big.NE = -19

export const fromDripToCfx = number => {
  try {
    const cfx = new Big(number).div(1e18).toString()
    return cfx
  } catch (e) {
    return number
  }
}

export const fromCfxToDrip = number => {
  try {
    const cfx = new Big(number).times(1e18).toString()
    return cfx
  } catch (e) {
    return number
  }
}

export const formatDigit = (num, digit) => {
  try {
    const bNum = new Big(num)
    const str = num + ''
    const strWithoutZero = removeZero(str)
    const strArr = strWithoutZero.split('.')
    // no digit
    if (!digit) return num
    // no decimal or digit < integer length
    else if (!strArr[1] || strArr[0].length >= digit)
      return toThousands(strArr[0])
    else if (strArr[0].length + strArr[1].length <= digit)
      return toThousands(strWithoutZero)
    else {
      const decimal = strArr[1].substring(0, digit - strArr[0].length)
      return toThousands(removeZero([strArr[0], decimal].join('.')))
    }
  } catch (e) {
    return num
  }
}

export const toThousands = (num, delimiter = ',', prevDelimiter = ',') => {
  try {
    const bNum = new Big(num)
    let str = num + ''
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
    return num
  }
}

export const removeZero = num => {
  try {
    const bNum = new Big(num)
    let str = num + ''
    let end = str.length - 1
    const strArr = str.split('.')
    if (!strArr[1]) return str
    else if (strArr[1].length === 0) return str.substring(0, end)
    else {
      for (let i = strArr[1].length; i > 0; i--) {
        // if str ends with 0
        end = str.length - 1
        if (str.lastIndexOf('0') === end) {
          // the length of decimal part is 1 and ends with 0
          if (str.charAt(end - 1) === '.') {
            return str.substring(0, end - 1)
          } else {
            str = str.substring(0, end)
          }
        } else {
          // if str ends with not 0
          return str
        }
      }
    }
  } catch (e) {
    return num
  }
}

export const formatAmount = num => {
  try {
    let bNum = new Big(num)
    const str = num + ''
    if (bNum.gte(Big(0)) && bNum.lt(Big(1e6))) {
      return formatDigit(str, 7)
    } else if (bNum.gte(Big(1e6)) && bNum.lt(Big(1e9))) {
      return toThousands(removeZero(bNum.div(1e6).round(3).toString())) + ' M'
    } else if (bNum.gte(Big(1e9)) && bNum.lt(Big(1e12))) {
      return toThousands(removeZero(bNum.div(1e9).round(3).toString())) + ' G'
    } else if (bNum.gte(Big(1e12)) && bNum.lt(Big(1e15))) {
      return toThousands(removeZero(bNum.div(1e12).round(3).toString())) + ' T'
    } else if (bNum.gte(Big(1e15))) {
      return toThousands(bNum.div(1e12).round().toString()) + ' T'
    }
  } catch (e) {
    return num
  }
}

export const formatAddress = address => {
  if (!address || typeof address !== 'string') return address
  const arr = address.split(':')
  if (arr.length < 2) return address
  const length = arr[1].length
  if (length !== 42) return address

  return `${arr[0]}:${arr[1].substring(0, 4)}...${arr[1].substring(length - 4)}`
}

export default Big
