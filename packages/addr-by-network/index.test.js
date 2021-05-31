// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import addrByNetwork from './index.js'

let address
describe('@cfxjs/addr-by-network', function () {
  test('eth hex address', () => {
    address = '0x208b86e65753bba8f557ac2a8a79ba6536ab05e2'
    expect(
      addrByNetwork({
        address,
        networkType: 'cfx',
        networkId: 1029,
        addressType: 'user',
      }),
    ).toBe('CFX:TYPE.USER:AAJJ1B1GM7K51MHZM80CZCX31KWXRM2F6JXVY30MVK')

    address = '0x208b86e65753bba8f557ac2a8a79ba6536ab05e2'
    expect(
      addrByNetwork({
        address,
        networkType: 'cfx',
        networkId: 1029,
        addressType: 'contract',
      }),
    ).toBe('CFX:TYPE.CONTRACT:ACAJ1B1GM7K51MHZM80CZCX31KWXRM2F6JA13FNTS4')

    address = '0x208b86e65753bba8f557ac2a8a79ba6536ab05e2'
    expect(
      addrByNetwork({
        address,
        networkType: 'cfx',
        networkId: 1029,
        addressType: 'null',
      }),
    ).toBe('CFX:TYPE.NULL:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0SFBNJM2')

    address = '0x208b86e65753bba8f557ac2a8a79ba6536ab05e2'
    expect(
      addrByNetwork({
        address,
        networkType: 'cfx',
        networkId: 1029,
        addressType: 'builtin',
      }),
    ).toBe('CFX:TYPE.BUILTIN:AAAJ1B1GM7K51MHZM80CZCX31KWXRM2F6JXTTX6EY4')

    address = '0x208b86e65753bba8f557ac2a8a79ba6536ab05e2'
    expect(addrByNetwork({address, networkType: 'eth', networkId: 1})).toBe(
      '0x208b86e65753bba8f557ac2a8a79ba6536ab05e2',
    )
  })

  test('cfx base32 address', () => {
    address = 'CFX:TYPE.USER:AAJJ1B1GM7K51MHZM80CZCX31KWXRM2F6JXVY30MVK'
    expect(
      addrByNetwork({
        address,
        networkType: 'cfx',
        networkId: 1029,
        addressType: 'user',
      }),
    ).toBe('CFX:TYPE.USER:AAJJ1B1GM7K51MHZM80CZCX31KWXRM2F6JXVY30MVK')
    address = 'CFX:TYPE.USER:AAJJ1B1GM7K51MHZM80CZCX31KWXRM2F6JXVY30MVK'
    expect(addrByNetwork({address, networkType: 'cfx', networkId: 1029})).toBe(
      'CFX:TYPE.USER:AAJJ1B1GM7K51MHZM80CZCX31KWXRM2F6JXVY30MVK',
    )
    address = 'CFX:TYPE.CONTRACT:ACAJ1B1GM7K51MHZM80CZCX31KWXRM2F6JA13FNTS4'
    expect(addrByNetwork({address, networkType: 'cfx', networkId: 1029})).toBe(
      'CFX:TYPE.CONTRACT:ACAJ1B1GM7K51MHZM80CZCX31KWXRM2F6JA13FNTS4',
    )
    address = 'CFX:TYPE.CONTRACT:ACAJ1B1GM7K51MHZM80CZCX31KWXRM2F6JA13FNTS4'
    expect(addrByNetwork({address, networkType: 'cfx', networkId: 1029})).toBe(
      'CFX:TYPE.CONTRACT:ACAJ1B1GM7K51MHZM80CZCX31KWXRM2F6JA13FNTS4',
    )
    address = 'CFX:TYPE.CONTRACT:ACAJ1B1GM7K51MHZM80CZCX31KWXRM2F6JA13FNTS4'
    expect(
      addrByNetwork({
        address,
        networkType: 'cfx',
        networkId: 1029,
        addressType: 'null',
      }),
    ).toBe('CFX:TYPE.NULL:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0SFBNJM2')
    expect(
      addrByNetwork({
        address,
        networkType: 'eth',
        networkId: 1029,
        privateKey:
          '0xA7C2DFA78CCA35B33EBC3728BD6229D18A64C95B38E364A9CCE05FF5F832E5D2',
      }),
    ).toBe('0xAFa2889e80619495738b0262C6B17471f29d9Dc5')
    address = 'CFX:TYPE.CONTRACT:ACAJ1B1GM7K51MHZM80CZCX31KWXRM2F6JA13FNTS4'
    expect(
      addrByNetwork({
        address,
        networkType: 'cfx',
        networkId: 1,
        addressType: 'contract',
      }),
    ).toBe('CFXTEST:TYPE.CONTRACT:ACAJ1B1GM7K51MHZM80CZCX31KWXRM2F6JM6MZRFMU')
  })

  test('error', () => {
    address = '0x208b86e65753bba8f557ac2a8a79ba6536ab05e2'
    expect(() =>
      addrByNetwork({
        address,
        networkType: 'cfx',
        networkId: 1029,
        addressType: 'foo',
      }),
    ).toThrowError(/Invalid addressType, must be one of/)

    address = '0x208b86e65753bba8f557ac2a8a79ba6536ab05e2'
    expect(() =>
      addrByNetwork({
        address,
        networkType: 'cfx',
        networkId: 1n,
        addressType: 'user',
      }),
    ).toThrowError(/Invalid networkId, must be a safe integer/)

    address = '0x208b86e65753bba8f557ac2a8a79ba6536ab05e2'
    expect(() =>
      addrByNetwork({address, networkType: 'cfx', addressType: 'user'}),
    ).toThrowError(/Invalid networkId, must be a safe integer/)

    address = null
    expect(() =>
      addrByNetwork({
        address,
        networkType: 'cfx',
        networkId: 1029,
        addressType: 'user',
      }),
    ).toThrowError(/Invalid address, must be a string/)

    address = '0x208b86e65753bba8f557ac2a8a79ba6536ab05e2'
    expect(() =>
      addrByNetwork({address, networkType: 'foo', networkId: 1029}),
    ).toThrowError(/Invalid networkType, must be cfx or eth/)

    address = 'CFX:TYPE.USER:AAJJ1B1GM7K51MHZM80CZCX31KWXRM2F6JXVY30MVK'
    expect(() =>
      addrByNetwork({address, networkType: 'eth', networkId: 1}),
    ).toThrowError(
      /Unable to convert base32 address into eth hex address without private key/,
    )

    address = 'CFX:TYPE.USER:AAJJ1B1GM7K51MHZM80CZCX31KWXRM2F6JXVY30MVK'
    expect(() =>
      addrByNetwork({
        address,
        networkType: 'cfx',
        addressType: 'contract',
        networkId: 1029,
      }),
    ).toThrowError(/Invalid base32 address, address type is invalid/)
  })
})
