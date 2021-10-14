// fix readable-stream error with snowpack
// https://github.com/nodejs/readable-stream/issues/456
import {keccak256 as etherjsKeccak256} from '@ethersproject/keccak256'
import {Buffer} from 'buffer'

export const keccak256 = (data, encoding) => {
  return toBuffer(etherjsKeccak256(Buffer.from(encoding || 'utf-8')))
}
export const toBuffer = (data, encoding) => {
  if (!encoding) {
    if (data.startsWith('0x')) {
      return Buffer.from(data.substring(2), 'hex')
    }

    return Buffer.from(data, 'hex')
  }

  return Buffer.from(data, encoding)
}
