import {expect, describe, it, vi} from 'vitest'
import {getNthAccountOfHDKey, validateHDPath, randomHDPath} from './'

// there is a promise task in getNthAccountOfHDKey, need to increase timeout to avoid test fail
vi.setConfig({testTimeout: 20000})

describe('HDKey', () => {
  it('should return a hdkey', async () => {
    const account = await getNthAccountOfHDKey({
      mnemonic:
        'error mom brown point sun magnet armor fish urge business until plastic',
      nth: 0,
      only0x1Prefixed: true,
    })

    expect(account).toBeDefined()
    expect(account.index).toBe(15)
    expect(account.address).toBe('0x12c557579a8ca61f94f6c5260cb144414cfec184')
  })

  it('should return a the right address', async () => {
    const account = await getNthAccountOfHDKey({
      mnemonic:
        'error mom brown point sun magnet armor fish urge business until plastic',
      nth: 0,
    })

    expect(account.address.toLowerCase()).toBe(
      '0x7b3d01a14c84181f4df3983ae68118e4bad48407',
    )
  })

  it('should be able to validate a hd key', async () => {
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
