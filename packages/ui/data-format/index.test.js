import {expect, describe, it} from 'vitest' // prettier-ignore
import {
  convertDecimal,
  fromCfxToDrip,
  fromDripToCfx,
  formatDigit,
  toThousands,
  trimZero,
  formatAmount,
  formatBalance,
  CFX_DECIMALS,
} from './'

describe('@fluent-wallet/data-format', () => {
  it('convertDecimal', async () => {
    expect(convertDecimal('1000000000000000000', 'divide', CFX_DECIMALS)).toBe(
      '1',
    )
    expect(convertDecimal('1', 'divide', CFX_DECIMALS)).toBe(
      '0.000000000000000001',
    )
  })

  it('fromCfxToDrip', async () => {
    expect(fromCfxToDrip('1')).toBe('1000000000000000000')
    expect(fromDripToCfx('1000000000000000000')).toBe('1')
  })

  it('formatDigit', async () => {
    expect(formatDigit('1.999999', 7)).toBe('1.999999')
    expect(formatDigit('19.999999', 7)).toBe('19.99999')
    expect(formatDigit('199.999999', 7)).toBe('199.9999')
    expect(formatDigit('1999.999999', 7)).toBe('1,999.999')
    expect(formatDigit('19999.999999', 7)).toBe('19,999.99')
    expect(formatDigit('199999.999999', 7)).toBe('199,999.9')
    expect(formatDigit('199999.999999', 6)).toBe('199,999')
    expect(formatDigit('199999.999999')).toBe('199999.999999')
  })

  it('toThousands', async () => {
    expect(toThousands('100000')).toBe('100,000')
    expect(toThousands('1000.00001')).toBe('1,000.00001')
    expect(toThousands('1000000000.00001')).toBe('1,000,000,000.00001')
    expect(toThousands('0.00001')).toBe('0.00001')
  })

  it('trimZero', async () => {
    expect(trimZero('100000')).toBe('100000')
    expect(trimZero('100000.0')).toBe('100000')
    expect(trimZero('100000.0001')).toBe('100000.0001')
    expect(trimZero('100000.1000')).toBe('100000.1')
    expect(trimZero('0.0000')).toBe('0')
    expect(trimZero('0.00001')).toBe('0.00001')
  })

  it('formatBalance', async () => {
    expect(formatBalance('1234567890.123456')).toBe('1,234,567,890.123456')
    expect(formatBalance('1234567890.1234560')).toBe('1,234,567,890.123456')
    expect(formatBalance('1234567890.1234567')).toBe('1,234,567,890.123456')
    expect(formatBalance('1234567890.123450')).toBe('1,234,567,890.12345')
  })

  it('formatAmount', async () => {
    expect(formatAmount('1999999.999999')).toBe('1.999 M')
    expect(formatAmount('19999999.999999')).toBe('19.999 M')
    expect(formatAmount('199999999.999999')).toBe('199.999 M')
    expect(formatAmount('1999999999.999900')).toBe('1.999 G')
    expect(formatAmount('19999999999.999000')).toBe('19.999 G')
    expect(formatAmount('199999999999.999000')).toBe('199.999 G')
    expect(formatAmount('1999999999999.990000')).toBe('1.999 T')
    expect(formatAmount('19999999999999.900000')).toBe('19.999 T')
    expect(formatAmount('199999999999999.000000')).toBe('199.999 T')
    expect(formatAmount('1999999999999999.000000')).toBe('1,999 T')
    expect(formatAmount('19999999999999999.000000')).toBe('19,999 T')
    expect(formatAmount('1.123450')).toBe('1.12345')
    expect(formatAmount('1260999.999999')).toBe('1.26 M')
  })
})
