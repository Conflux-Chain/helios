import {expect, describe, it} from 'vitest'
import {
  shortenCfxAddress,
  shortenEthAddress,
  getEllipsStr,
  shortenAddress,
} from './'

describe('@fluent-wallet/shorten-address', () => {
  it('getEllipsStr', async () => {
    expect(getEllipsStr('abcde', 1, 1)).toBe('a...e')
    expect(getEllipsStr('abcde', 3, 2)).toBe('abcde')
    expect(getEllipsStr('abcde', 4, 5)).toBe('abcde')
    expect(() => getEllipsStr(null, 1, 1)).toThrowError('Invalid args')
    expect(() => getEllipsStr('abcde', 1, -1)).toThrowError('Invalid args')
  })

  it('shortenCfxAddress', async () => {
    expect(
      shortenCfxAddress('cfx:aarc9abycue0hhzgyrr53m6cxedgccrmmyybjgh4xg'),
    ).toBe('cfx:aar...ybjgh4xg')
    expect(
      shortenCfxAddress('cfxtest:aame5p2tdzfsc3zsmbg1urwkg5ax22epg27cnu1rwm'),
    ).toBe('cfxtest:aam...1rwm')
    expect(() =>
      shortenCfxAddress(
        'CFX:TYPE.USER:AARC9ABYCUE0HHZGYRR53M6CXEDGCCRMMYYBJGH4XG',
      ),
    ).toThrowError('Only shorten the conflux address not containing type')
  })

  it('shortenEthAddress', async () => {
    expect(
      shortenEthAddress('0x1036AE28C608e9e7681a1B4886668be0cf934A8a'),
    ).toBe('0x1036...4A8a')
    expect(() => shortenEthAddress('asdasdad')).toThrowError(
      'Invalid ethereum address',
    )
  })
  it('shortenAddress', async () => {
    expect(
      shortenAddress('cfx:aarc9abycue0hhzgyrr53m6cxedgccrmmyybjgh4xg'),
    ).toBe('cfx:aar...ybjgh4xg')
    expect(
      shortenAddress('cfxtest:aame5p2tdzfsc3zsmbg1urwkg5ax22epg27cnu1rwm'),
    ).toBe('cfxtest:aam...1rwm')
    expect(() =>
      shortenAddress(
        'CFX:TYPE.USER:AARC9ABYCUE0HHZGYRR53M6CXEDGCCRMMYYBJGH4XG',
      ),
    ).toThrowError('Only shorten the conflux address not containing type')
    expect(shortenAddress('0x1036AE28C608e9e7681a1B4886668be0cf934A8a')).toBe(
      '0x1036...4A8a',
    )
    expect(() => shortenAddress('asdasdad')).toThrowError('Invalid address')
  })
})
