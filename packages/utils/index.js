import randombytes from 'randombytes'

export const randomHex = function (size) {
  return '0x' + randombytes(size).toString('hex')
}

export const randomInt = function (a) {
  return Math.floor(Math.random() * a)
}

export {default as stripHexPrefix} from 'strip-hex-prefix'
export {default as isHexPrefixed} from 'is-hex-prefixed'
export {getStorageItem, setStorageItem} from './storage-helper'
export {default as fetchWithStorage} from './fetch-with-storage'
