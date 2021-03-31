import {expect, describe, it} from '@jest/globals'
import {dataTree} from './testlib/randomData'
import {encode, decode} from './index'
import * as rlp from 'rlp'

describe('RLP', () => {
  it('Must operate identically to reference implementation', () => {
    // Builds a test set of 256 random dataTrees + 2 default
    let dataTrees = []
    dataTrees.push([
      '0x00112233',
      '0x00',
      '0x44',
      '0x55',
      '0xf0',
      '0xff',
      ['0x66'],
      ['0x77', '0x88'],
      '0x',
      '0x',
      '0x99aabb',
    ])
    dataTrees.push('0x00112233445566778899aabbccddeeff')
    for (let i = 0; i < 256; ++i) dataTrees.push(dataTree())

    // Tests if they encode and decode identically to the reference implementation
    dataTrees.forEach(dataTree => {
      const refEnc = '0x' + rlp.encode(dataTree).toString('hex')
      const impEnc = encode(dataTree)
      const impDec = decode(impEnc)
      try {
        expect(refEnc === impEnc).toBe(true)
        expect(JSON.stringify(impDec) === JSON.stringify(dataTree)).toBe(true)
      } catch (e) {
        console.log(JSON.stringify(dataTree, null, 2))
      }
    })
  })
})
