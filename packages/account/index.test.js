// eslint-disable-next-line no-unused-vars
import {describe, it, expect, test} from 'vitest'
import {
  fromPrivate,
  toChecksum,
  create,
  randomHexAddress,
  isHexAddress,
  isUserHexAddress,
  isContractAddress,
  isNullHexAddress,
  isBuiltInAddress,
  isCfxHexAddress,
  validateHexAddress,
  isChecksummed,
  randomAddressType,
  randomCfxHexAddress,
  randomPrivateKey,
  validatePrivateKey,
} from './'
import {
  NULL_HEX_ADDRESS,
  INTERNAL_CONTRACTS_HEX_ADDRESS,
} from '@fluent-wallet/consts'

// const echash =
//   '0x82ff40c0a986c6a5cfad4ddf4c3aa6996f1a7837f9c398e17e5de5cbd5a12b28'
const ecprivkey =
  '0x3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1'
const address = '0xed54a7c1d8634bb589f24bb7f05a5554b36f9618'
const checksumAddress = '0xED54a7C1d8634BB589f24Bb7F05a5554b36F9618'
// const signature =
//   '0x99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca661b'
// const r = '0x99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9'
// const s = '0x129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca66'
// const v = '0x1b' // 27

describe('account', () => {
  describe('fromPrivate', () => {
    it('should return the right address', async () => {
      expect(fromPrivate(ecprivkey)).toEqual({
        address: checksumAddress,
        privateKey: ecprivkey,
      })
    })
  })

  describe('toChecksum', () => {
    it('should return the right checksum address', async () => {
      expect(toChecksum(address)).toEqual(checksumAddress)
    })
  })

  describe('create', () => {
    it('should return the private key and address', async () => {
      const account = create()
      expect(account.address).toEqual(
        expect.stringMatching(/^0x[0-9a-fA-F]{40}$/),
      )
      expect(fromPrivate(account.privateKey).address).toEqual(account.address)
    })
  })

  describe('randomHexAddress', () => {
    it('should generate a random builtin address', async () => {
      expect(
        INTERNAL_CONTRACTS_HEX_ADDRESS.includes(randomHexAddress('builtin')),
      ).toBe(true)
    })

    it('should generate the null address', async () => {
      expect(randomHexAddress('null')).toEqual(NULL_HEX_ADDRESS)
    })

    it('should generate a contract address', async () => {
      expect(randomHexAddress('contract').startsWith('0x8')).toBe(true)
    })

    it('should generate a account address', async () => {
      expect(randomHexAddress('user').startsWith('0x1')).toBe(true)
    })
    it('no args', () => {
      expect(randomHexAddress()).toBeDefined()
    })
  })

  describe('checks', () => {
    it('isHexAddress', () => {
      expect(isHexAddress('0x0000000000000000000000000000000000000000')).toBe(
        true,
      )
      expect(isHexAddress('0x000000000000000000000000000000000000000')).toBe(
        false,
      )
    })

    it('isNullHexAddress', () => {
      expect(
        isNullHexAddress('0x0000000000000000000000000000000000000000'),
      ).toBe(true)
    })

    it('isContractAddress', () => {
      expect(
        isContractAddress('0x8000000000000000000000000000000000000000'),
      ).toBe(true)
      expect(
        isContractAddress('0x1000000000000000000000000000000000000000'),
      ).toBe(false)
      expect(
        isContractAddress('0x2000000000000000000000000000000000000000'),
      ).toBe(false)
    })

    it('isUserHexAddress', () => {
      expect(
        isUserHexAddress('0x8000000000000000000000000000000000000000'),
      ).toBe(false)
      expect(
        isUserHexAddress('0x1000000000000000000000000000000000000000'),
      ).toBe(true)
      expect(
        isUserHexAddress('0x2000000000000000000000000000000000000000'),
      ).toBe(false)
    })

    it('isBuiltInAddress', () => {
      expect(
        isBuiltInAddress('0x0888000000000000000000000000000000000000'),
      ).toBe(true)
      expect(
        isBuiltInAddress('0x0888000000000000000000000000000000000001'),
      ).toBe(true)
      expect(
        isBuiltInAddress('0x0888000000000000000000000000000000000002'),
      ).toBe(true)
      expect(
        isBuiltInAddress('0x0888000000000000000000000000000000000003'),
      ).toBe(false)
      expect(
        isBuiltInAddress('0x0888000000000000000000000000000000000004'),
      ).toBe(false)
    })

    it('isCfxHexAddress', () => {
      expect(
        isCfxHexAddress('0x0888000000000000000000000000000000000000'),
      ).toBe(true)
      expect(
        isCfxHexAddress('0x1888000000000000000000000000000000000000'),
      ).toBe(true)
      expect(
        isCfxHexAddress('0x8888000000000000000000000000000000000000'),
      ).toBe(true)
      expect(
        isCfxHexAddress('0x0000000000000000000000000000000000000000'),
      ).toBe(true)
      expect(
        isCfxHexAddress('0x2000000000000000000000000000000000000000'),
      ).toBe(false)
      expect(
        isCfxHexAddress('0x0200000000000000000000000000000000000000'),
      ).toBe(false)
    })

    it('validateHexAddress', () => {
      expect(
        validateHexAddress('0x0888000000000000000000000000000000000000'),
      ).toBe(true)
      expect(
        validateHexAddress('0x1888000000000000000000000000000000000000'),
      ).toBe(true)
      expect(
        validateHexAddress('0x8888000000000000000000000000000000000000'),
      ).toBe(true)
      expect(
        validateHexAddress('0x0000000000000000000000000000000000000000'),
      ).toBe(true)
      expect(
        validateHexAddress('0x2000000000000000000000000000000000000000'),
      ).toBe(false)
      expect(
        validateHexAddress('0x0200000000000000000000000000000000000000'),
      ).toBe(false)

      expect(
        validateHexAddress(
          '0x0888000000000000000000000000000000000000',
          'builtin',
        ),
      ).toBe(true)
      expect(
        validateHexAddress(
          '0x1888000000000000000000000000000000000000',
          'user',
        ),
      ).toBe(true)
      expect(
        validateHexAddress(
          '0x8888000000000000000000000000000000000000',
          'contract',
        ),
      ).toBe(true)
      expect(
        validateHexAddress(
          '0x0000000000000000000000000000000000000000',
          'null',
        ),
      ).toBe(true)
      expect(
        validateHexAddress('0x2000000000000000000000000000000000000000', 'eth'),
      ).toBe(true)
      expect(
        validateHexAddress('0x0200000000000000000000000000000000000000', 'eth'),
      ).toBe(true)

      expect(() => validateHexAddress(1)).toThrow(
        'Invalid address, must be a 0x-prefixed string',
      )
      expect(() =>
        validateHexAddress('0000000000000000000000000000000000000000'),
      ).toThrow('Invalid address, must be a 0x-prefixed string')
    })
  })

  describe('help methods', () => {
    test('isChecksummed', () => {
      expect(isChecksummed(checksumAddress)).toBe(true)
      expect(isChecksummed('0x00000000000000000000000000000000000000011')).toBe(
        false,
      )
    })
    test('randomAddressType', () => {
      expect(randomAddressType()).toBeDefined()
    })

    test('randomCfxHexAddress', () => {
      const address = randomCfxHexAddress()
      expect(
        isBuiltInAddress(address) ||
          isUserHexAddress(address) ||
          isContractAddress(address) ||
          isNullHexAddress(address),
      ).toBe(true)
    })

    test('randomPrivateKey', () => {
      const pk = randomPrivateKey()

      expect(create({pk}).privateKey).toEqual(pk)
    })

    test('validatePrivateKey', () => {
      const pk = randomPrivateKey()

      expect(validatePrivateKey(pk)).toBe(true)
      expect(validatePrivateKey('0x')).toBe(false)
    })
  })
})
