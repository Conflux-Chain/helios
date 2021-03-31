import randombytes from 'randombytes'

export const randomHex = function (size) {
  return '0x' + randombytes(size).toString('hex')
}
