// eslint-disable-next-line no-unused-vars
import {expect, describe, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {getNthAccountOfHDKey} from './'
import {generateMnemonic} from 'bip39'

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
})
