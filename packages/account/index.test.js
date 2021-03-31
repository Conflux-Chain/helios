// eslint-disable-next-line no-unused-vars
import {expect, describe, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {
  sign,
  encodeSignature,
  decodeSignature,
  fromPrivate,
  toChecksum,
  recover,
  create,
} from './'

const echash =
  '0x82ff40c0a986c6a5cfad4ddf4c3aa6996f1a7837f9c398e17e5de5cbd5a12b28'
const ecprivkey =
  '0x3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1'
const address = '0xed54a7c1d8634bb589f24bb7f05a5554b36f9618'
const checksumAddress = '0xED54a7C1d8634BB589f24Bb7F05a5554b36F9618'
const signature =
  '0x99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca661b'
const r = '0x99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9'
const s = '0x129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca66'
const v = '0x1b' // 27

describe('account', function () {
  describe('sign', function () {
    it('should return the right signature', async function () {
      expect(sign(echash, ecprivkey)).toBe(
        '0x99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca661b',
      )
    })
  })

  describe('encodeSignature', function () {
    it('should return the right signature', async function () {
      expect(encodeSignature([v, r, s])).toBe(signature)
    })
  })

  describe('decodeSignature', function () {
    it('should return the right decoded r s v', async function () {
      expect(
        decodeSignature(
          '0x99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca661b',
        ),
      ).toEqual([v, r, s])
    })
  })

  describe('recover', function () {
    it('should recover a public key', function () {
      expect(recover(echash, signature)).toBe(checksumAddress)
    })
  })

  describe('fromPrivate', function () {
    it('should return the right address', async function () {
      expect(fromPrivate(ecprivkey)).toEqual({
        address: checksumAddress,
        privateKey: ecprivkey,
      })
    })
  })

  describe('toChecksum', function () {
    it('should return the right checksum address', async function () {
      expect(toChecksum(address)).toEqual(checksumAddress)
    })
  })

  describe('create', function () {
    it('should return the private key and address', async function () {
      const account = create()
      expect(account.address).toEqual(
        expect.stringMatching(/^0x[0-9a-fA-F]{40}$/),
      )
      expect(fromPrivate(account.privateKey).address).toEqual(account.address)
    })
  })
})
