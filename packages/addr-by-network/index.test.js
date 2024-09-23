import {describe, test, expect} from 'vitest'
import addrByNetwork from './index.js'

let address
describe('@fluent-wallet/addr-by-network', () => {
  test('eth hex address', () => {
    address = '0x208b86e65753bba8f557ac2a8a79ba6536ab05e2'
    expect(
      addrByNetwork({
        address,
        networkType: 'cfx',
        networkId: 1029,
        addressType: 'user',
      }),
    ).toBe('cfx:aajj1b1gm7k51mhzm80czcx31kwxrm2f6jxvy30mvk')

    address = '0x208b86e65753bba8f557ac2a8a79ba6536ab05e2'
    expect(
      addrByNetwork({
        address,
        networkType: 'cfx',
        networkId: 1029,
        addressType: 'contract',
      }),
    ).toBe('cfx:acaj1b1gm7k51mhzm80czcx31kwxrm2f6ja13fnts4')

    address = '0x208b86e65753bba8f557ac2a8a79ba6536ab05e2'
    expect(
      addrByNetwork({
        address,
        networkType: 'cfx',
        networkId: 1029,
        addressType: 'null',
      }),
    ).toBe('cfx:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0sfbnjm2')

    address = '0x208b86e65753bba8f557ac2a8a79ba6536ab05e2'
    expect(
      addrByNetwork({
        address,
        networkType: 'cfx',
        networkId: 1029,
        addressType: 'builtin',
      }),
    ).toBe('cfx:aaaj1b1gm7k51mhzm80czcx31kwxrm2f6jxttx6ey4')

    address = '0x208b86e65753bba8f557ac2a8a79ba6536ab05e2'
    expect(addrByNetwork({address, networkType: 'eth', networkId: 1})).toBe(
      '0x208b86e65753bba8f557ac2a8a79ba6536ab05e2',
    )
  })

  test('cfx base32 address', () => {
    address = 'cfx:aajj1b1gm7k51mhzm80czcx31kwxrm2f6jxvy30mvk'
    expect(
      addrByNetwork({
        address,
        networkType: 'cfx',
        networkId: 1029,
        addressType: 'user',
      }),
    ).toBe('cfx:aajj1b1gm7k51mhzm80czcx31kwxrm2f6jxvy30mvk')
    address = 'cfx:aajj1b1gm7k51mhzm80czcx31kwxrm2f6jxvy30mvk'
    expect(addrByNetwork({address, networkType: 'cfx', networkId: 1029})).toBe(
      'cfx:aajj1b1gm7k51mhzm80czcx31kwxrm2f6jxvy30mvk',
    )
    address = 'cfx:acaj1b1gm7k51mhzm80czcx31kwxrm2f6ja13fnts4'
    expect(addrByNetwork({address, networkType: 'cfx', networkId: 1029})).toBe(
      'cfx:acaj1b1gm7k51mhzm80czcx31kwxrm2f6ja13fnts4',
    )
    address = 'cfx:acaj1b1gm7k51mhzm80czcx31kwxrm2f6ja13fnts4'
    expect(addrByNetwork({address, networkType: 'cfx', networkId: 1029})).toBe(
      'cfx:acaj1b1gm7k51mhzm80czcx31kwxrm2f6ja13fnts4',
    )
    address = 'cfx:acaj1b1gm7k51mhzm80czcx31kwxrm2f6ja13fnts4'
    expect(
      addrByNetwork({
        address,
        networkType: 'cfx',
        networkId: 1029,
        addressType: 'null',
      }),
    ).toBe('cfx:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0sfbnjm2')
    expect(
      addrByNetwork({
        address,
        networkType: 'eth',
        networkId: 1029,
        privateKey:
          '0xA7C2DFA78CCA35B33EBC3728BD6229D18A64C95B38E364A9CCE05FF5F832E5D2',
      }),
    ).toBe('0xAFa2889e80619495738b0262C6B17471f29d9Dc5')
    address = 'cfx:acaj1b1gm7k51mhzm80czcx31kwxrm2f6ja13fnts4'
    expect(
      addrByNetwork({
        address,
        networkType: 'cfx',
        networkId: 1,
        addressType: 'contract',
      }),
    ).toBe('cfxtest:acaj1b1gm7k51mhzm80czcx31kwxrm2f6jm6mzrfmu')

    expect(
      addrByNetwork({
        address: '0x108b86e65753bba8f557ac2a8a79ba6536ab05e2',
        networkType: 'cfx',
        networkId: 1,
      }),
    ).toMatchInlineSnapshot(
      `"cfxtest:aajj1b1gm7k51mhzm80czcx31kwxrm2f6j34hkuazd"`,
    )
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

    address = 'cfx:aajj1b1gm7k51mhzm80czcx31kwxrm2f6jxvy30mvk'
    expect(() =>
      addrByNetwork({address, networkType: 'eth', networkId: 1}),
    ).toThrowError(
      /Unable to convert base32 address into eth hex address without private key/,
    )

    address = 'cfx:aajj1b1gm7k51mhzm80czcx31kwxrm2f6jxvy30mvk'
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
