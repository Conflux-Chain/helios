// eslint-disable-next-line no-unused-vars
import {expect, describe, it} from '@jest/globals' // prettier-ignore
import {
  fromDripToCfx,
  fromCfxToDrip,
  formatDigit,
  toThousands,
  trimZero,
  formatAmount,
  formatAddress,
} from './'

describe('@cfxjs/data-format', function () {
  it('fromDripToCfx', async function () {
    expect(fromDripToCfx('1000000000000000000')).toBe('1')
    expect(fromDripToCfx('1')).toBe('0.000000000000000001')
    expect(fromDripToCfx(null)).toBe(null)
  })

  it('fromCfxToDrip', async function () {
    expect(fromCfxToDrip('1')).toBe('1000000000000000000')
    expect(fromCfxToDrip('0.000000000000000001')).toBe('1')
    expect(fromCfxToDrip(null)).toBe(null)
  })

  it('formatDigit', async function () {
    expect(formatDigit('1.999999', 7)).toBe('1.999999')
    expect(formatDigit('19.999999', 7)).toBe('19.99999')
    expect(formatDigit('199.999999', 7)).toBe('199.9999')
    expect(formatDigit('1999.999999', 7)).toBe('1,999.999')
    expect(formatDigit('19999.999999', 7)).toBe('19,999.99')
    expect(formatDigit('199999.999999', 7)).toBe('199,999.9')
    expect(formatDigit('199999.999999', 6)).toBe('199,999')
    expect(formatDigit('199999.999999')).toBe('199999.999999')
    expect(formatDigit(null)).toBe(null)
  })

  it('toThousands', async function () {
    expect(toThousands('100000')).toBe('100,000')
    expect(toThousands('1000.00001')).toBe('1,000.00001')
    expect(toThousands('1000000000.00001')).toBe('1,000,000,000.00001')
    expect(toThousands('0.00001')).toBe('0.00001')
    expect(toThousands(null)).toBe(null)
  })

  it('trimZero', async function () {
    expect(trimZero('100000')).toBe('100000')
    expect(trimZero('100000.0')).toBe('100000')
    expect(trimZero('100000.0001')).toBe('100000.0001')
    expect(trimZero('100000.1000')).toBe('100000.1')
    expect(trimZero('0.0000')).toBe('0')
    expect(trimZero('0.00001')).toBe('0.00001')
    expect(trimZero(null)).toBe(null)
  })

  it('formatAmount', async function () {
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
    expect(formatAmount(null)).toBe(null)
  })

  it('formatAddress', async function () {
    expect(
      formatAddress('cfx:aarc9abycue0hhzgyrr53m6cxedgccrmmyybjgh4xg'),
    ).toBe('cfx:aarc...h4xg')
    expect(
      formatAddress('CFX:TYPE.USER:AARC9ABYCUE0HHZGYRR53M6CXEDGCCRMMYYBJGH4XG'),
    ).toBe('CFX:TYPE.USER:AARC9ABYCUE0HHZGYRR53M6CXEDGCCRMMYYBJGH4XG')
    expect(formatAmount(null)).toBe(null)
  })
})
