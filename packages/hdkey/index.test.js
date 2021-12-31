// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {
  getNthAccountOfHDKey,
  validateHDPath,
  randomHDPath,
  generateMnemonic,
} from './'
// import {generateMnemonic} from 'bip39'

describe('HDKey', function () {
  it('should return a hdkey', async function () {
    const account = await getNthAccountOfHDKey({
      mnemonic: generateMnemonic(),
      nth: 1,
      only0x1Prefixed: true,
    })

    expect(account).toBeDefined()
    expect(account.index >= 1).toBe(true)
  })

  it('should return a the right address', async function () {
    const account = await getNthAccountOfHDKey({
      mnemonic:
        'error mom brown point sun magnet armor fish urge business until plastic',
      nth: 0,
    })

    expect(account.address.toLowerCase()).toBe(
      '0x7b3d01a14c84181f4df3983ae68118e4bad48407',
    )
  })

  it('should be able to validate a hd key', async function () {
    expect(validateHDPath(`m/44'/503'/0'/0`)).toBe(true)
    expect(validateHDPath(`m/44'/60'/0'/0`)).toBe(true)
    expect(validateHDPath(`m/44'/61'/0'/0`)).toBe(true)
    expect(validateHDPath(`m/44'/60'/160720'/0`)).toBe(true)
    expect(validateHDPath(randomHDPath())).toBe(true)
    expect(validateHDPath(`m/44'/60'/2147483647'/0`)).toBe(true)
    expect(validateHDPath(`m/44'/60'/2147483648'/0`)).toBe(false)
    expect(
      validateHDPath(
        `m/44'/60'/${(0b11111111111111111111111111111110).toString()}'/0`,
      ),
    ).toBe(false)
    expect(validateHDPath(`a/44'/503'/0'/0`)).toBe(false)
    expect(validateHDPath(`a/44'/503'/0'/0'`)).toBe(false)
    expect(validateHDPath(`m/44'/503'/0'/0/0`)).toBe(false)
    expect(validateHDPath(`m/44/503'/0'/0`)).toBe(false)
    expect(validateHDPath(`m/44'/503/0'/0`)).toBe(false)
    expect(validateHDPath(`m/44'/503'/0/0`)).toBe(false)
  })
})
